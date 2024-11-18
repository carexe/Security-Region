import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, 
         Tooltip, Legend, ReferenceLine } from 'recharts';

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

interface Limits {
  g2_max: number;
  g3_max: number;
}

interface SecurityRegionChartProps {
  data: {
    constraints: Constraint[];
  };
  limits: Limits;
}

const SecurityRegionChart: React.FC<SecurityRegionChartProps> = ({ data, limits }) => {
  // Generate points for the feasible region boundary
  const getFeasiblePoints = () => {
    const points = [];
    data.constraints.forEach((constraint) => {
      const { a, b, c } = constraint.coefficients;
      
      // Skip constraints with very small coefficients
      if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) return;
      
      // Generate points along the constraint line
      const numPoints = 50;
      if (Math.abs(b) < 1e-10) {
        // Vertical line
        const x = c / a;
        if (x >= 0 && x <= limits.g2_max) {
          for (let y = 0; y <= limits.g3_max; y += limits.g3_max / numPoints) {
            points.push({ x, y, constraint: constraint.description });
          }
        }
      } else {
        // Regular line
        for (let x = 0; x <= limits.g2_max; x += limits.g2_max / numPoints) {
          const y = (-a * x + c) / b;
          if (y >= 0 && y <= limits.g3_max) {
            points.push({ x, y, constraint: constraint.description });
          }
        }
      }
    });
    return points;
  };

  return (
    <div className="h-[600px] w-full">
      <ScatterChart
        margin={{ top: 20, right: 50, bottom: 60, left: 50 }}
        width={800}
        height={600}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          type="number"
          dataKey="x"
          name="Generator 2"
          domain={[0, limits.g2_max]}
          label={{ value: 'Generator 2 Power Output (MW)', position: 'bottom', offset: 20 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Generator 3"
          domain={[0, limits.g3_max]}
          label={{ value: 'Generator 3 Power Output (MW)', angle: -90, position: 'left', offset: 20 }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [`${value.toFixed(2)} MW`, name]}
          labelFormatter={(label: string) => `Constraint: ${label}`}
        />
        <Legend 
          layout="vertical" 
          align="right"
          verticalAlign="top"
          wrapperStyle={{ paddingLeft: '20px' }}
        />
        
        {/* Plot constraint lines */}
        {data.constraints.map((constraint, index) => (
          <Scatter
            key={index}
            name={constraint.description}
            data={getFeasiblePoints().filter(p => p.constraint === constraint.description)}
            line={{ stroke: constraint.color, strokeWidth: 2, strokeDasharray: constraint.style === 'dashed' ? '5 5' : undefined }}
            lineType="joint"
            fill={constraint.color}
            shape="circle"
            legendType="line"
          />
        ))}
        
        {/* Generator limits */}
        <ReferenceLine 
          x={limits.g2_max} 
          stroke="green" 
          label={{ value: 'G2 Max', position: 'top' }} 
          strokeDasharray="3 3"
        />
        <ReferenceLine 
          y={limits.g3_max} 
          stroke="green" 
          label={{ value: 'G3 Max', position: 'right' }} 
          strokeDasharray="3 3"
        />
      </ScatterChart>
    </div>
  );
};

export default SecurityRegionChart;