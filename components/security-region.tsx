'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Define status type to make state management clearer
type Status = 'idle' | 'loading' | 'error' | 'success';

export function SecurityRegion() {
  // Consolidated state
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<SecurityRegionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Cache API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Initial state for controls
  const [currentLoads, setCurrentLoads] = useState<LoadData>({
    bus5: { p: 90 },
    bus7: { p: 100 },
    bus9: { p: 125 }
  });

  const [branchRatings, setBranchRatings] = useState<BranchRatings>({
    1: { rating: 180, reactance: 0.0576 },
    2: { rating: 180, reactance: 0.092 },
    3: { rating: 180, reactance: 0.17 },
    4: { rating: 180, reactance: 0.0586 },
    5: { rating: 180, reactance: 0.1008 },
    6: { rating: 180, reactance: 0.072 },
    7: { rating: 180, reactance: 0.0625 },
    8: { rating: 180, reactance: 0.161 },
    9: { rating: 180, reactance: 0.085 }
  });

  const [generatorLimits, setGeneratorLimits] = useState<GeneratorLimits>({
    g2: { min: 0, max: 163 },
    g3: { min: 0, max: 163 }
  });

  const [additionalBranches, setAdditionalBranches] = useState<NewBranch[]>([]);

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    if (status === 'loading') return; // Prevent multiple concurrent requests
    
    try {
      setStatus('loading');
      
      // Build query params
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

      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${apiUrl}/api/security-region?${queryParams}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.statistics || !result.limits || !result.constraints) {
        throw new Error('Invalid data format received from server');
      }

      setData(result);
      setStatus('success');
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStatus('error');
    }
  }, [apiUrl, currentLoads, branchRatings, generatorLimits, additionalBranches]);

  // Event handlers
  const handleLoadChange = (newLoads: LoadData) => {
    setCurrentLoads(newLoads);
  };

  const handleBranchRatingChange = (branchNum: number, value: number) => {
    setBranchRatings(prev => ({
      ...prev,
      [branchNum]: { ...prev[branchNum], rating: value }
    }));
  };

  const handleGeneratorLimitsChange = (newLimits: GeneratorLimits) => {
    setGeneratorLimits(newLimits);
  };

  const handleAddBranch = (newBranch: NewBranch) => {
    setAdditionalBranches(prev => [...prev, newBranch]);
  };

  const handleRemoveBranch = (index: number) => {
    setAdditionalBranches(prev => prev.filter((_, i) => i !== index));
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Render functions
  const renderLoading = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <RefreshCcw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg font-medium">Calculating Security Region...</span>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <button 
            onClick={fetchData}
            className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );

  // Main render
  if (status === 'idle' || !data) return null;
  if (status === 'error') return renderError();

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
          onCalculate={fetchData}
        />

        <GeneratorControl 
          onGeneratorLimitsChange={handleGeneratorLimitsChange}
          onCalculate={fetchData} 
        />
        
        <BranchControl 
          onBranchRatingChange={handleBranchRatingChange}
          onCalculate={fetchData}
          branchRatings={branchRatings} 
        />
        
        <NewBranchControl 
          onAddBranch={handleAddBranch}
          onRemoveBranch={handleRemoveBranch}
          onCalculate={fetchData}
          additionalBranches={additionalBranches} 
        />
      </div>

      {status === 'loading' && renderLoading()}

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