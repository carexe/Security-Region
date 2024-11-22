import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react'; // Import trash icon
import { lineNames, LineNumberType } from './LineMapping';

interface NewBranch {
  fromBus: number;
  toBus: number;
  templateBranch: LineNumberType;  // Update this type
}

interface NewBranchControlProps {
  onAddBranch: (branch: NewBranch) => void;
  onRemoveBranch: (index: number) => void;
  onCalculate: () => void;
  additionalBranches: NewBranch[];
}

const NewBranchControl: React.FC<NewBranchControlProps> = ({ 
  onAddBranch, 
  onRemoveBranch,
  onCalculate,
  additionalBranches 
}) => {
  const [newBranch, setNewBranch] = useState<NewBranch>({
    fromBus: 1,
    toBus: 2,
    templateBranch: 1 as LineNumberType
  });
  
  const buses = Array.from({ length: 9 }, (_, i) => i + 1);

  const handleAddBranch = () => {
    if (newBranch.fromBus === newBranch.toBus) {
      alert("From and To buses must be different");
      return;
    }
    onAddBranch(newBranch);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Network Topology Control</CardTitle>
          <button 
            onClick={onCalculate}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Calculate
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new branch controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Bus</label>
              <Select
                value={newBranch.fromBus.toString()}
                onValueChange={(value) => setNewBranch({
                  ...newBranch,
                  fromBus: parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem key={bus} value={bus.toString()}>
                      Bus {bus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Bus</label>
              <Select
                value={newBranch.toBus.toString()}
                onValueChange={(value) => setNewBranch({
                  ...newBranch,
                  toBus: parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((bus) => (
                    <SelectItem key={bus} value={bus.toString()}>
                      Bus {bus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Copy Parameters From</label>
              <Select
                value={newBranch.templateBranch.toString()}
                onValueChange={(value) => setNewBranch({
                  ...newBranch,
                  templateBranch: parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(lineNames) as unknown as LineNumberType[]).map((branchNum) => (
                    <SelectItem key={branchNum} value={branchNum.toString()}>
                      {lineNames[branchNum]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddBranch}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add Branch
            </Button>
          </div>

          {/* List of added branches */}
          {additionalBranches.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Additional Branches:</h3>
              <div className="space-y-2">
                {additionalBranches.map((branch, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span>
                      Bus {branch.fromBus} - Bus {branch.toBus} 
                      (Parameters from {lineNames[branch.templateBranch as LineNumberType]})
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveBranch(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewBranchControl;