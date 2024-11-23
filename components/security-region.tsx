'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, AlertTriangle, Coffee } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import SecurityRegionChart from './SecurityRegionChart';
import LoadControl from './LoadControl';
import SingleLineDiagram from './SingleLineDiagram';
import BranchControl from './BranchControl';
import GeneratorControl from './GeneratorControl';
import NewBranchControl from './NewBranchControl';
import { formatConstraintDescription } from './LineMapping';
import { LoadData, BranchRatings, GeneratorLimits, NewBranch, SecurityRegionData } from './types';

// Constants defined outside component
const INITIAL_LOADS: LoadData = {
  bus5: { p: 90 },
  bus7: { p: 100 },
  bus9: { p: 125 }
};

const INITIAL_BRANCH_RATINGS: BranchRatings = {
  1: { rating: 180, reactance: 0.0576 },
  2: { rating: 180, reactance: 0.092 },
  3: { rating: 180, reactance: 0.17 },
  4: { rating: 180, reactance: 0.0586 },
  5: { rating: 180, reactance: 0.1008 },
  6: { rating: 180, reactance: 0.072 },
  7: { rating: 180, reactance: 0.0625 },
  8: { rating: 180, reactance: 0.161 },
  9: { rating: 180, reactance: 0.085 }
};

const INITIAL_GENERATOR_LIMITS: GeneratorLimits = {
  g2: { min: 0, max: 163 },
  g3: { min: 0, max: 163 }
};

const POLL_INTERVAL = 1000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
} as const;

// Component with explicit display name for ESLint
export const SecurityRegion: React.FC = () => {
  // Core state management
  const [data, setData] = useState<SecurityRegionData | null>(null);
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    isCalculating: false,
    error: null as string | null,
    isServerStarting: true
  });
  const [currentLoads, setCurrentLoads] = useState<LoadData>(INITIAL_LOADS);
  const [branchRatings, setBranchRatings] = useState<BranchRatings>(INITIAL_BRANCH_RATINGS);
  const [generatorLimits, setGeneratorLimits] = useState<GeneratorLimits>(INITIAL_GENERATOR_LIMITS);
  const [additionalBranches, setAdditionalBranches] = useState<NewBranch[]>([]);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Refs for cleanup and mounted state
  const mountedRef = useRef(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Server status check
  const checkServerStatus = useCallback(async (): Promise<boolean> => {
    if (!mountedRef.current) return false;
  
    try {
      // Set a short timeout for health check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout
  
      const response = await fetch(`${API_URL}/health`, {
        mode: 'cors',
        headers: API_HEADERS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const isReady = response.ok;
      
      if (mountedRef.current) {
        setLoadingState(prev => ({ ...prev, isServerStarting: !isReady }));
      }
      return isReady;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Health check timed out');
      }
      if (mountedRef.current) {
        setLoadingState(prev => ({ ...prev, isServerStarting: true }));
      }
      return false;
    }
  }, []);

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!mountedRef.current || loadingState.isCalculating || !shouldFetch) return;

    try {
      setLoadingState(prev => ({ ...prev, isCalculating: true, error: null }));
      
      const queryParams = new URLSearchParams({
        bus5_p: currentLoads.bus5.p.toString(),
        bus7_p: currentLoads.bus7.p.toString(),
        bus9_p: currentLoads.bus9.p.toString(),
        ...Object.entries(branchRatings).reduce((acc, [branch, params]) => ({
          ...acc,
          [`branch${branch}_rating`]: params.rating.toString()
        }), {}),
        g2_min: generatorLimits.g2.min.toString(),
        g2_max: generatorLimits.g2.max.toString(),
        g3_min: generatorLimits.g3.min.toString(),
        g3_max: generatorLimits.g3.max.toString(),
        new_branches: JSON.stringify(additionalBranches)
      });

      const response = await fetch(`${API_URL}/api/security-region?${queryParams}`, {
        mode: 'cors',
        headers: API_HEADERS
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.statistics || !result.limits || !result.constraints) {
        throw new Error('Invalid data format received from server');
      }
      
      if (mountedRef.current) {
        setData(result);
        setLoadingState(prev => ({ 
          ...prev, 
          isServerStarting: false,
          isLoading: false
        }));
      }
    } catch (err) {
      if (mountedRef.current && !loadingState.isServerStarting) {
        setLoadingState(prev => ({ 
          ...prev, 
          error: err instanceof Error ? err.message : 'An unknown error occurred'
        }));
      }
    } finally {
      if (mountedRef.current) {
        setLoadingState(prev => ({ ...prev, isCalculating: false }));
        setShouldFetch(false);
      }
    }
  }, [currentLoads, branchRatings, generatorLimits, additionalBranches, loadingState.isCalculating, loadingState.isServerStarting, shouldFetch]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  // Server status polling effect
  useEffect(() => {
    const initializeData = async () => {
      if (!mountedRef.current) return;
      
      const isServerReady = await checkServerStatus();
      
      if (!isServerReady && mountedRef.current) {
        pollIntervalRef.current = setInterval(async () => {
          if (!mountedRef.current) return;
          
          const ready = await checkServerStatus();
          if (ready && mountedRef.current) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setShouldFetch(true);
          }
        }, POLL_INTERVAL);
      } else if (mountedRef.current) {
        setShouldFetch(true);
      }
    };

    initializeData();
  }, [checkServerStatus]);

  // Data fetching effect
  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, [shouldFetch, fetchData]);

    // Event handlers
  const handleLoadChange = useCallback((newLoads: LoadData) => {
    setCurrentLoads(newLoads);
  }, []);

  const handleBranchRatingChange = useCallback((branchNum: number, value: number) => {
    setBranchRatings(prev => ({
      ...prev,
      [branchNum]: { ...prev[branchNum], rating: value }
    }));
  }, []);

  const handleGeneratorLimitsChange = useCallback((newLimits: GeneratorLimits) => {
    setGeneratorLimits(newLimits);
  }, []);

  const handleAddBranch = useCallback((newBranch: NewBranch) => {
    setAdditionalBranches(prev => [...prev, newBranch]);
  }, []);

  const handleRemoveBranch = useCallback((index: number) => {
    setAdditionalBranches(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCalculate = useCallback(() => {
    setShouldFetch(true);
  }, []);
  // Loading states
  if (loadingState.isServerStarting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Coffee className="w-12 h-12 animate-bounce text-amber-600" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Backend Server is Starting Up</h3>
          <p className="text-sm text-gray-600">
            This may take up to 60 seconds as we wake up the free-tier server...
          </p>
          <p className="text-xs text-gray-500">
            Free tier instance at {API_URL}
          </p>
        </div>
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (loadingState.isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (loadingState.error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {loadingState.error}
            <button 
              onClick={handleCalculate}
              className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-4">
      <SingleLineDiagram 
        loads={currentLoads} 
        additionalBranches={additionalBranches}
        branchRatings={branchRatings}
      />
      
      <div className="space-y-6">
        <LoadControl 
          onLoadChange={handleLoadChange} 
          onCalculate={handleCalculate}
        />

        <GeneratorControl 
          onGeneratorLimitsChange={handleGeneratorLimitsChange}
          onCalculate={handleCalculate} 
        />
        
        <BranchControl 
          onBranchRatingChange={handleBranchRatingChange}
          onCalculate={handleCalculate}
          branchRatings={branchRatings} 
        />
        
        <NewBranchControl 
          onAddBranch={handleAddBranch}
          onRemoveBranch={handleRemoveBranch}
          onCalculate={handleCalculate}
          additionalBranches={additionalBranches} 
        />
      </div>

      {(loadingState.isLoading || loadingState.isCalculating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <div className="flex items-center space-x-3">
              <RefreshCcw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-lg font-medium">
                {loadingState.isCalculating ? "Calculating Security Region..." : "Preparing Calculations..."}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {loadingState.isCalculating ? (
                <div className="space-y-2">
                  <p>Running N-1 security analysis</p>
                  <p>Computing feasible region</p>
                  <p>Analyzing binding constraints</p>
                </div>
              ) : (
                <p>Setting up computation parameters...</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Region Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Feasible Region:</span>
                {' '}{data.statistics.feasiblePercentage.toFixed(1)}%
              </p>
              <p className="text-sm">
                <span className="font-semibold">Binding Constraints:</span>
                {' '}{data.statistics.bindingConstraints}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Total Constraints:</span>
                {' '}{data.statistics.totalConstraints}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.constraints.map((constraint, index) => (
                <div 
                  key={index}
                  className="p-2 rounded border"
                  style={{ borderColor: constraint.color }}
                >
                  <p className="text-sm font-medium">
                    {formatConstraintDescription(constraint.description)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {constraint.coefficients.a.toFixed(3)}·P_g2 + 
                    {constraint.coefficients.b.toFixed(3)}·P_g3 ≤ 
                    {constraint.coefficients.c.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Region Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <SecurityRegionChart data={data} limits={data.limits} />
        </CardContent>
      </Card>
    </div>
  );
};