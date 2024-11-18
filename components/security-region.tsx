'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
}

export function SecurityRegion() {
  const [data, setData] = useState<SecurityRegionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [retryCount]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Attempting to fetch from:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/security-region`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.text();
          errorMessage = `Server error (${response.status}): ${errorData}`;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Received data:', result);
  
      if (!result.statistics || !result.limits || !result.constraints) {
        throw new Error('Invalid data format received from server');
      }
      
      setData(result);
    } catch (err) {
      console.error('Fetch error:', err);
      console.error('API URL:', process.env.NEXT_PUBLIC_API_URL);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
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

  const { statistics, limits, constraints } = data;

  // Helper function to create constraint line points
  const createConstraintPoints = (constraint: Constraint) => {
    const { a, b, c } = constraint.coefficients;
    const points = [];
    const numPoints = 100;
    
    if (Math.abs(b) < 1e-10) {
      // Vertical line
      const x = c / a;
      if (x >= 0 && x <= limits.g2_max) {
        for (let y = 0; y <= limits.g3_max; y += limits.g3_max / numPoints) {
          points.push({ x, y });
        }
      }
    } else {
      // Normal line
      for (let x = 0; x <= limits.g2_max; x += limits.g2_max / numPoints) {
        const y = (-a * x + c) / b;
        if (y >= 0 && y <= limits.g3_max) {
          points.push({ x, y });
        }
      }
    }
    
    return points;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security Region Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Feasible Region:</span>
                {' '}{statistics.feasiblePercentage.toFixed(1)}%
              </p>
              <p className="text-sm">
                <span className="font-semibold">Binding Constraints:</span>
                {' '}{statistics.bindingConstraints}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Total Constraints:</span>
                {' '}{statistics.totalConstraints}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Feasible Area:</span>
                {' '}{statistics.feasibleArea.toFixed(1)} MW²
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Constraints Card */}
        <Card>
          <CardHeader>
            <CardTitle>Active Constraints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {constraints.map((constraint, index) => (
                <div 
                  key={index}
                  className="p-2 rounded border"
                  style={{ borderColor: constraint.color }}
                >
                  <p className="text-sm font-medium">{constraint.description}</p>
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

      {/* Security Region Visualization */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Security Region Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  domain={[0, limits.g2_max]} 
                  label={{ value: 'Generator 2 Power Output (MW)', position: 'bottom' }} 
                />
                <YAxis 
                  domain={[0, limits.g3_max]}
                  label={{ value: 'Generator 3 Power Output (MW)', angle: -90, position: 'left' }} 
                />
                <Tooltip />
                <Legend />
                {constraints.map((constraint, index) => (
                  <Line
                    key={index}
                    data={createConstraintPoints(constraint)}
                    dataKey="y"
                    stroke={constraint.color}
                    strokeDasharray={constraint.style === 'dashed' ? '5 5' : 
                                  constraint.style === 'dashdot' ? '5 2' : undefined}
                    dot={false}
                    name={constraint.description}
                    xAxisId={0}
                    type="monotone"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}