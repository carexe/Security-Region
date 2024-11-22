import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { lineNames } from './LineMapping';

interface NewBranch {
  fromBus: number;
  toBus: number;
  templateBranch: number;
}

interface NewBranchControlProps {
  onAddBranch: (branch: NewBranch) => void;
}

const NewBranchControl: React.FC<NewBranchControlProps> = ({ onAddBranch }) => {
  const [newBranch, setNewBranch] = useState<NewBranch>({
    fromBus: 1,
    toBus: 2,
    templateBranch: 1
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
        <CardTitle>Add New Branch</CardTitle>
      </CardHeader>
      <CardContent>
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
                {Object.entries(lineNames).map(([branchNum, name]) => (
                  <SelectItem key={branchNum} value={branchNum}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAddBranch}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add Branch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewBranchControl;