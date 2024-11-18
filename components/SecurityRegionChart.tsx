import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ReferenceLine, Area
} from 'recharts';

interface Point {
  x: number;
  y: number;
  constraint: string;
}

interface SecurityRegionChartProps {
  data: {
    constraints: Array<{
      coefficients: {
        a: number;
        b: number;
        c: number;
      };
      description: string;
      color: string;
      style: string;
    }>;
  };
  limits: {
    g2_max: number;
    g3_max: number;
  };
}

const SecurityRegionChart: React.FC<SecurityRegionChartProps> = ({ data, limits }) => {
  const getConstraintPoints = (constraint: any) => {
    const { a, b, c } = constraint.coefficients;
    const points: Point[] = [];
    const numPoints = 100;

    if (Math.abs(b) < 1e-10) {
      if (Math.abs(a) > 1e-10) {
        const x = c / a;
        if (x >= 0 && x <= limits.g2_max) {
          for (let y = 0; y <= limits.g3_max; y += limits.g3_max / numPoints) {
            points.push({ x, y, constraint: constraint.description });
          }
        }
      }
    } else {
      for (let x = 0; x <= limits.g2_max; x += limits.g2_max / numPoints) {
        const y = (-a * x + c) / b;
        if (y >= 0 && y <= limits.g3_max) {
          points.push({ x, y, constraint: constraint.description });
        }
      }
    }
    return points;
  };

  // Calculate feasible region points
  const getFeasibleRegion = () => {
    const points: Point[] = [];
    const numPoints = 100;

    for (let x = 0; x <= limits.g2_max; x += limits.g2_max / numPoints) {
      for (let y = 0; y <= limits.g3_max; y += limits.g3_max / numPoints) {
        let isFeasible = true;
        
        for (const constraint of data.constraints) {
          const { a, b, c } = constraint.coefficients;
          if (a * x + b * y > c) {
            isFeasible = false;
            break;
          }
        }

        if (isFeasible) {
          points.push({ x, y, constraint: 'feasible' });
        }
      }
    }
    return points;
  };

  return (
    <div className="h-[600px] w-full">
      <LineChart
        margin={{ top: 20, right: 50, bottom: 60, left: 50 }}
        width={800}
        height={600}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          type="number"
          dataKey="x"
          domain={[0, limits.g2_max]}
          label={{ value: 'Generator 2 Power Output (MW)', position: 'bottom', offset: 20 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={[0, limits.g3_max]}
          label={{ value: 'Generator 3 Power Output (MW)', angle: -90, position: 'left', offset: 20 }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => `${value.toFixed(2)} MW`}
        />
        <Legend 
          layout="vertical" 
          align="right"
          verticalAlign="top"
          wrapperStyle={{ paddingLeft: '20px' }}
        />

        {/* Shaded feasible region */}
        <Area
          type="monotone"
          data={getFeasibleRegion()}
          dataKey="y"
          fill="#82ca9d"
          fillOpacity={0.2}
          stroke="none"
        />
        
        {/* Constraint lines */}
        {data.constraints.map((constraint, index) => (
          <Line
            key={index}
            type="monotone"
            data={getConstraintPoints(constraint)}
            dataKey="y"
            stroke={constraint.color}
            name={constraint.description}
            strokeWidth={2}
            strokeDasharray={constraint.style === 'dashed' ? '5 5' : undefined}
            dot={false}
          />
        ))}
        
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
      </LineChart>
    </div>
  );
};

export default SecurityRegionChart;