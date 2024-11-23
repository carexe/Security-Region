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

// Constants outside component to prevent recreation
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
} as const;

export const SecurityRegion: React.FC = () => {
  // State management
  const [data, setData] = useState<SecurityRegionData | null>(null);
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    error: null as string | null
  });
  const [currentLoads, setCurrentLoads] = useState<LoadData>(INITIAL_LOADS);
  const [branchRatings, setBranchRatings] = useState<BranchRatings>(INITIAL_BRANCH_RATINGS);
  const [generatorLimits, setGeneratorLimits] = useState<GeneratorLimits>(INITIAL_GENERATOR_LIMITS);
  const [additionalBranches, setAdditionalBranches] = useState<NewBranch[]>([]);

  // Mounted ref for cleanup
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoadingState(prev => ({ ...prev, isLoading: true, error: null }));

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

      if (!mountedRef.current) return;

      setData(result);
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    } catch (err) {
      if (!mountedRef.current) return;

      setLoadingState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An unknown error occurred',
        isLoading: false
      }));
    }
  }, [currentLoads, branchRatings, generatorLimits, additionalBranches]);
  // Effect for initial load only
  useEffect(() => {
    // Initial fetch when component mounts
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]); // Include fetchData in dependencies

  // Event handlers - all changes require Calculate button
  const handleLoadChange = useCallback((newLoads: LoadData) => {
    setCurrentLoads(newLoads);
    // No automatic fetch - wait for Calculate button
  }, []);

  const handleBranchRatingChange = useCallback((branchNum: number, value: number) => {
    setBranchRatings(prev => ({
      ...prev,
      [branchNum]: { ...prev[branchNum], rating: value }
    }));
    // No automatic fetch - wait for Calculate button
  }, []);

  const handleGeneratorLimitsChange = useCallback((newLimits: GeneratorLimits) => {
    setGeneratorLimits(newLimits);
    // No automatic fetch - wait for Calculate button
  }, []);

  const handleAddBranch = useCallback((newBranch: NewBranch) => {
    setAdditionalBranches(prev => [...prev, newBranch]);
    // No automatic fetch - wait for Calculate button
  }, []);

  const handleRemoveBranch = useCallback((index: number) => {
    setAdditionalBranches(prev => prev.filter((_, i) => i !== index));
    // No automatic fetch - wait for Calculate button
  }, []);

  // Calculate button handler - only way to trigger calculations
  const handleCalculate = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (loadingState.isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
        <div className="text-center">
          <p className="text-sm text-gray-600">Loading security region data...</p>
        </div>
      </div>
    );
  }

  // Error state
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

      {loadingState.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <div className="flex items-center space-x-3">
              <RefreshCcw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-lg font-medium">
                Calculating Security Region...
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <div className="space-y-2">
                <p>Running N-1 security analysis</p>
                <p>Computing feasible region</p>
                <p>Analyzing binding constraints</p>
              </div>
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