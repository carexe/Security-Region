import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GeneratorLimits {
  g2: { min: number; max: number; };
  g3: { min: number; max: number; };
}

interface GeneratorControlProps {
  onGeneratorLimitsChange: (limits: GeneratorLimits) => void;
}

const GeneratorControl: React.FC<GeneratorControlProps> = ({ onGeneratorLimitsChange }) => {
  const [limits, setLimits] = useState<GeneratorLimits>({
    g2: { min: 0, max: 163 },
    g3: { min: 0, max: 163 }
  });

  const handleSliderChange = (gen: 'g2' | 'g3', type: 'min' | 'max', value: number) => {
    const newLimits = {
      ...limits,
      [gen]: {
        ...limits[gen],
        [type]: value
      }
    };
    
    // Ensure min doesn't exceed max
    if (type === 'min' && value > limits[gen].max) {
      newLimits[gen].min = limits[gen].max;
    }
    // Ensure max doesn't fall below min
    if (type === 'max' && value < limits[gen].min) {
      newLimits[gen].max = limits[gen].min;
    }
    
    setLimits(newLimits);
    onGeneratorLimitsChange(newLimits);
  };

  const handleInputChange = (gen: 'g2' | 'g3', type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 500) {
      const newLimits = {
        ...limits,
        [gen]: {
          ...limits[gen],
          [type]: numValue
        }
      };
      
      // Apply the same validation as slider change
      if (type === 'min' && numValue > limits[gen].max) {
        newLimits[gen].min = limits[gen].max;
      }
      if (type === 'max' && numValue < limits[gen].min) {
        newLimits[gen].max = limits[gen].min;
      }
      
      setLimits(newLimits);
      onGeneratorLimitsChange(newLimits);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Generator Limits Control</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(['g2', 'g3'] as const).map((gen) => (
            <div key={gen} className="space-y-4">
              <h3 className="font-semibold">Generator {gen.toUpperCase().slice(1)}</h3>
              
              {/* Minimum Output Control */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Minimum Output</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max={limits[gen].max}
                    value={limits[gen].min}
                    onChange={(e) => handleSliderChange(gen, 'min', Number(e.target.value))}
                    className="flex-grow"
                  />
                  <input
                    type="number"
                    value={limits[gen].min}
                    min="0"
                    max={limits[gen].max}
                    onChange={(e) => handleInputChange(gen, 'min', e.target.value)}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <span className="text-sm text-gray-500">MW</span>
                </div>
              </div>
              
              {/* Maximum Output Control */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Maximum Output</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min={limits[gen].min}
                    max="500"
                    value={limits[gen].max}
                    onChange={(e) => handleSliderChange(gen, 'max', Number(e.target.value))}
                    className="flex-grow"
                  />
                  <input
                    type="number"
                    value={limits[gen].max}
                    min={limits[gen].min}
                    max="500"
                    onChange={(e) => handleInputChange(gen, 'max', e.target.value)}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <span className="text-sm text-gray-500">MW</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratorControl;