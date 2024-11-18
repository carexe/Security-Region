'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/security-region`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Changed to 'include' to match backend's supports_credentials: True
        mode: 'cors'  // Explicitly set CORS mode
      });
      
      console.log('Fetching from:', `${apiUrl}/api/security-region`); // Debug log
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Fetch error:', err); // Debug log
      console.error('API URL:', process.env.NEXT_PUBLIC_API_URL); // Debug log
      setError('Failed to fetch security region data: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <AlertTriangle className="w-8 h-8 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  const { statistics, limits, constraints } = data;

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
                {constraints.map((constraint, index) => {
                  const { a, b, c } = constraint.coefficients;
                  // Generate points for the constraint line
                  const points = [];
                  const numPoints = 100;
                  for (let x = 0; x <= limits.g2_max; x += limits.g2_max / numPoints) {
                    const y = (-a * x + c) / b;
                    if (y >= 0 && y <= limits.g3_max) {
                      points.push({ x, y });
                    }
                  }
                  
                  return (
                    <Line
                      key={index}
                      data={points}
                      dataKey="y"
                      stroke={constraint.color}
                      strokeDasharray={constraint.style === 'dashed' ? '5 5' : 
                                    constraint.style === 'dashdot' ? '5 2' : undefined}
                      dot={false}
                      name={constraint.description}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}