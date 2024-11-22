import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { lineNames } from './LineMapping';

interface BranchControlProps {
  onBranchRatingChange: (ratings: BranchRatings) => void;
  onCalculate: () => void;
}

interface BranchRatings {
  [key: number]: number;  // Maps branch number to rating
}

const BranchControl: React.FC<BranchControlProps> = ({ 
  onBranchRatingChange,
  onCalculate 
}) => {
  const [ratings, setRatings] = useState<BranchRatings>({
    1: 180, 2: 180, 3: 180, 4: 180, 5: 180,
    6: 180, 7: 180, 8: 180, 9: 180
  });

  const handleSliderChange = (branchNum: number, value: number) => {
    const newRatings = {
      ...ratings,
      [branchNum]: value
    };
    setRatings(newRatings);
    onBranchRatingChange(newRatings);
  };

  const handleInputChange = (branchNum: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 500) {
      const newRatings = {
        ...ratings,
        [branchNum]: numValue
      };
      setRatings(newRatings);
      onBranchRatingChange(newRatings);
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
              <h3 className="font-semibold text-sm">{name}</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={ratings[parseInt(branchNum)]}
                  onChange={(e) => handleSliderChange(parseInt(branchNum), Number(e.target.value))}
                  className="flex-grow"
                />
                <input
                  type="number"
                  value={ratings[parseInt(branchNum)]}
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