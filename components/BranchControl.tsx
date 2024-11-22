import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { lineNames } from './LineMapping';

interface BranchParameters {
  rating: number;
  reactance: number;
}

interface BranchRatings {
  [key: number]: BranchParameters;
}

interface BranchControlProps {
  onBranchRatingChange: (branchNum: number, value: number) => void;
  onCalculate: () => void;
  branchRatings: BranchRatings;
}

const BranchControl: React.FC<BranchControlProps> = ({ 
  onBranchRatingChange,
  onCalculate,
  branchRatings 
}) => {

  const handleSliderChange = (branchNum: number, value: number) => {
    onBranchRatingChange(branchNum, value);
  };

  const handleInputChange = (branchNum: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 500) {
      onBranchRatingChange(branchNum, numValue);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Branch Ratings Control</CardTitle>
          <button 
            onClick={onCalculate}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Calculate
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(lineNames).map(([branchNum, name]) => (
            <div key={branchNum} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{name}</h3>
                <span className="text-xs text-gray-500">
                  X = {branchRatings[parseInt(branchNum)].reactance.toFixed(4)} p.u.
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={branchRatings[parseInt(branchNum)].rating}
                  onChange={(e) => handleSliderChange(parseInt(branchNum), Number(e.target.value))}
                  className="flex-grow"
                />
                <input
                  type="number"
                  value={branchRatings[parseInt(branchNum)].rating}
                  min="0"
                  max="500"
                  onChange={(e) => handleInputChange(parseInt(branchNum), e.target.value)}
                  className="w-20 px-2 py-1 border rounded"
                />
                <span className="text-sm text-gray-500">MVA</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchControl;