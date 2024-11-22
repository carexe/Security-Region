'use client';

import React, { useState, useEffect } from 'react';
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

interface LoadData {
  bus5: { p: number };
  bus7: { p: number };
  bus9: { p: number };
}

interface BranchRatings {
  [key: number]: number;  // Maps branch number to rating
}

interface GeneratorLimits {
  g2: { min: number; max: number; };
  g3: { min: number; max: number; };
}

interface NewBranch {
  fromBus: number;
  toBus: number;
  templateBranch: number;
}

interface Coefficients {
  a: number;
  b: number;
  c: number;
}

interface Constraint {
  coefficients: Coefficients;
  description: string;
  color: string;
  style: string;
}

interface Statistics {
  feasiblePercentage: number;
  bindingConstraints: number;
  totalConstraints: number;
  feasibleArea: number;
}

interface Limits {
  g2_max: number;
  g3_max: number;
}

interface SecurityRegionData {
  statistics: Statistics;
  limits: Limits;
  constraints: Constraint[];
  feasibleRegion: Array<{x: number, y: number}>;
  loadData: LoadData;
}

export function SecurityRegion() {
  // Existing state variables
  const [data, setData] = useState<SecurityRegionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [serverStarting, setServerStarting] = useState(true);
  const [currentLoads, setCurrentLoads] = useState<LoadData>({
    bus5: { p: 90 },
    bus7: { p: 100 },
    bus9: { p: 125 }
  });

  // New state variables for enhanced controls
  const [branchRatings, setBranchRatings] = useState<BranchRatings>({
    1: 180, 2: 180, 3: 180, 4: 180, 5: 180,
    6: 180, 7: 180, 8: 180, 9: 180
  });

  const [generatorLimits, setGeneratorLimits] = useState<GeneratorLimits>({
    g2: { min: 0, max: 163 },
    g3: { min: 0, max: 163 }
  });

  const [additionalBranches, setAdditionalBranches] = useState<NewBranch[]>([]);

  // Add effect to monitor server starting state
  useEffect(() => {
    console.log('Server starting state changed:', serverStarting);
  }, [serverStarting]);

  // Event handlers for new controls
  const handleLoadChange = (newLoads: LoadData) => {
    setCurrentLoads(newLoads);
  };

  const handleBranchRatingChange = (newRatings: BranchRatings) => {
    setBranchRatings(newRatings);
  };

  const handleGeneratorLimitsChange = (newLimits: GeneratorLimits) => {
    setGeneratorLimits(newLimits);
  };

  const handleAddBranch = (newBranch: NewBranch) => {
    setAdditionalBranches(prev => [...prev, newBranch]);
  };
  // Initial fetch only once when component mounts
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing data...');
      setServerStarting(true);  // Start with serverStarting true
      
      const isServerReady = await checkServerStatus();
      if (!isServerReady) {
        console.log('Server not ready, starting polling...');
        const pollInterval = setInterval(async () => {
          console.log('Polling server status...');
          const ready = await checkServerStatus();
          if (ready) {
            console.log('Server is ready after polling');
            clearInterval(pollInterval);
            fetchData();
          }
        }, 2000);
        return () => clearInterval(pollInterval);
      }
      console.log('Server ready on initial check');
      fetchData();
    };

    initializeData();
  }, []);

  const checkServerStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Checking server status at:', apiUrl);
      
      const response = await fetch(`${apiUrl}/health`, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response status:', response.status);
      
      if (response.ok) {
        console.log('Server is ready');
        setServerStarting(false);
        return true;
      } else {
        console.log('Server is not ready, status:', response.status);
        setServerStarting(true);
        return false;
      }
    } catch (error: unknown) {
      // Type guard for error object
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : 'Unknown type';
      
      console.log('Server check error details:', {
        error,
        message: errorMessage,
        type: errorName
      });
      setServerStarting(true);
      return false;
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchData();
  };

  const handleCalculate = async () => {
    const isServerReady = await checkServerStatus();
    if (!isServerReady) {
      setServerStarting(true);
      // Start polling until server is ready
      const pollInterval = setInterval(async () => {
        const ready = await checkServerStatus();
        if (ready) {
          clearInterval(pollInterval);
          fetchData();
        }
      }, 2000);
    } else {
      fetchData();
    }
  };

  const fetchData = async () => {
    try {
      const isServerReady = await checkServerStatus();
      if (!isServerReady) {
        setServerStarting(true);
        console.log('Server not ready during fetch attempt');
        return;
      }

      setLoading(true);
      setCalculating(true); // Set calculating state
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Attempting to fetch from:', apiUrl);
      
      // Updated query parameters to include all system modifications
      const queryParams = new URLSearchParams({
        // Load parameters
        bus5_p: currentLoads.bus5.p.toString(),
        bus7_p: currentLoads.bus7.p.toString(),
        bus9_p: currentLoads.bus9.p.toString(),
        
        // Branch ratings
        ...Object.entries(branchRatings).reduce((acc, [branch, rating]) => ({
          ...acc,
          [`branch${branch}_rating`]: rating.toString()
        }), {}),
        
        // Generator limits
        g2_min: generatorLimits.g2.min.toString(),
        g2_max: generatorLimits.g2.max.toString(),
        g3_min: generatorLimits.g3.min.toString(),
        g3_max: generatorLimits.g3.max.toString(),
        
        // Additional branches
        new_branches: JSON.stringify(additionalBranches)
      });
      
      const response = await fetch(`${apiUrl}/api/security-region?${queryParams}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.statistics || !result.limits || !result.constraints) {
        throw new Error('Invalid data format received from server');
      }
      
      setData(result);
      setServerStarting(false);
    } catch (err) {
      console.error('Fetch error:', err);
      const isServerStarting = await checkServerStatus();
      if (!isServerStarting) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setCalculating(false); // Reset calculating state
      setLoading(false);
    }
  };
  // Check serverStarting first, before any other conditions
  if (serverStarting) {
    console.log('Rendering server starting message');
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Coffee className="w-12 h-12 animate-bounce text-amber-600" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Backend Server is Starting Up</h3>
          <p className="text-sm text-gray-600">
            This may take up to 60 seconds as we wake up the free-tier server...
          </p>
          <p className="text-xs text-gray-500">
            Free tier instance at {process.env.NEXT_PUBLIC_API_URL}
          </p>
        </div>
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (loading && !data) {  // Only show loading on initial load
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <button 
              onClick={handleRetry}
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
      />
      
      <div className="space-y-6">
        <LoadControl 
          onLoadChange={handleLoadChange} 
          onCalculate={handleCalculate}
        />

        <GeneratorControl 
          onGeneratorLimitsChange={handleGeneratorLimitsChange} 
        />
        
        <BranchControl 
          onBranchRatingChange={handleBranchRatingChange} 
        />
        
        <NewBranchControl 
          onAddBranch={handleAddBranch} 
        />
      </div>

      {(loading || calculating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <div className="flex items-center space-x-3">
              <RefreshCcw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-lg font-medium">
                {calculating ? "Calculating Security Region..." : "Preparing Calculations..."}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {calculating ? (
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
}