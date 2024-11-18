'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import SecurityRegionChart from './SecurityRegionChart';
import LoadControl from './LoadControl';
import SingleLineDiagram from './SingleLineDiagram';
import { formatConstraintDescription } from './LineMapping';

interface LoadData {
  bus5: { p: number };
  bus7: { p: number };
  bus9: { p: number };
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
}

export function SecurityRegion() {
  const [data, setData] = useState<SecurityRegionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentLoads, setCurrentLoads] = useState<LoadData>({
    bus5: { p: 90 },
    bus7: { p: 100 },
    bus9: { p: 125 }
  });

  // Initial fetch only once when component mounts
  useEffect(() => {
    fetchData();
  }, []);  // Empty dependency array - only run once

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchData();
  };

  const handleLoadChange = (newLoads: LoadData) => {
    console.log('Loads updated:', newLoads);
    setCurrentLoads(newLoads);
  };

  const handleCalculate = () => {
    console.log('Calculating with loads:', currentLoads);
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Attempting to fetch from:', apiUrl);
      
      // Add loads as query parameters
      const queryParams = new URLSearchParams({
        bus5_p: currentLoads.bus5.p.toString(),
        bus7_p: currentLoads.bus7.p.toString(),
        bus9_p: currentLoads.bus9.p.toString()
      });
      
      const response = await fetch(`${apiUrl}/api/security-region?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Full API Response:', result);
      
      if (!result.statistics || !result.limits || !result.constraints) {
        throw new Error('Invalid data format received from server');
      }
      
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-6">
        <SingleLineDiagram loads={currentLoads} />
      </div>
      <LoadControl 
        onLoadChange={handleLoadChange} 
        onCalculate={handleCalculate}
      />
      
      {loading && (  // Show loading overlay during calculations
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <RefreshCcw className="w-6 h-6 animate-spin text-blue-500" />
            <span>Calculating...</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <p className="text-sm font-medium">{formatConstraintDescription(constraint.description)}</p>
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

      <Card>
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