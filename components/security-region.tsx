'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, AlertTriangle, Coffee } from 'lucide-react';
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
  const [serverStarting, setServerStarting] = useState(false);
  const [currentLoads, setCurrentLoads] = useState<LoadData>({
    bus5: { p: 90 },
    bus7: { p: 100 },
    bus9: { p: 125 }
  });

  const checkServerStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        setServerStarting(false);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Server still starting...');
      setServerStarting(true);
      return false;
    }
  };

  // Initial fetch only once when component mounts
  useEffect(() => {
    const initializeData = async () => {
      // First check if server is ready
      const isServerReady = await checkServerStatus();
      if (!isServerReady) {
        // If server not ready, start polling
        const pollInterval = setInterval(async () => {
          const ready = await checkServerStatus();
          if (ready) {
            clearInterval(pollInterval);
            fetchData();
          }
        }, 2000); // Poll every 2 seconds
        return () => clearInterval(pollInterval);
      }
      fetchData();
    };

    initializeData();
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchData();
  };

  const handleLoadChange = (newLoads: LoadData) => {
    console.log('Loads updated:', newLoads);
    setCurrentLoads(newLoads);
  };

  const handleCalculate = async () => {
    console.log('Calculating with loads:', currentLoads);
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
      setServerStarting(false);
    } catch (err) {
      console.error('Fetch error:', err);
      // Check if it's a server starting issue
      const isServerStarting = await checkServerStatus();
      if (!isServerStarting) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (serverStarting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Coffee className="w-12 h-12 animate-bounce text-amber-600" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Backend Server is Starting Up</h3>
          <p className="text-sm text-gray-600">
            This may take up to 50 seconds as we wake up the free-tier server...
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
      <SingleLineDiagram loads={currentLoads} />
      
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
        {/* Rest of your component remains the same */}
      </div>
    </div>
  );
}