import React, { useState } from 'react';

interface LoadData {
  bus5: { p: number };
  bus7: { p: number };
  bus9: { p: number };
}

interface LoadControlProps {
  onLoadChange: (loads: LoadData) => void;
  onCalculate: () => void;
}

const LoadControl: React.FC<LoadControlProps> = ({ onLoadChange, onCalculate }) => {
  const [loads, setLoads] = useState<LoadData>({
    bus5: { p: 90 },
    bus7: { p: 100 },
    bus9: { p: 125 }
  });

  const handleSliderChange = (bus: 'bus5' | 'bus7' | 'bus9', value: number) => {
    const newLoads = {
      ...loads,
      [bus]: { p: value }
    };
    setLoads(newLoads);
    onLoadChange(newLoads);
  };

  const handleInputChange = (bus: 'bus5' | 'bus7' | 'bus9', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 200) {
      const newLoads = {
        ...loads,
        [bus]: { p: numValue }
      };
      setLoads(newLoads);
      onLoadChange(newLoads);
    }
  };

  const handleCalculateClick = () => {
    // Ensure parent has latest load values
    onLoadChange(loads);
    // Then trigger calculation
    onCalculate();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Load Control</h2>
        <button 
          onClick={handleCalculateClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Calculate Security Region
        </button>
      </div>
      <div className="space-y-6">
        {(['bus5', 'bus7', 'bus9'] as const).map((bus) => (
          <div key={bus} className="space-y-2">
            <h3 className="font-semibold">Bus {bus.slice(3)} Load</h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="200"
                value={loads[bus].p}
                onChange={(e) => handleSliderChange(bus, Number(e.target.value))}
                className="flex-grow"
              />
              <input
                type="number"
                value={loads[bus].p}
                min="0"
                max="200"
                onChange={(e) => handleInputChange(bus, e.target.value)}
                className="w-20 px-2 py-1 border rounded"
              />
              <span className="text-sm text-gray-500">MW</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadControl;