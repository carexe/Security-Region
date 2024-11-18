import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ReferenceLine, Area, ComposedChart
} from 'recharts';

interface Point {
  x: number;
  y: number;
  constraint: string;
}

interface Constraint {
  coefficients: {
    a: number;
    b: number;
    c: number;
  };
  description: string;
  color: string;
  style: string;
}

interface SecurityRegionChartProps {
  data: {
    constraints: Constraint[];
    feasibleRegion: Array<{x: number, y: number}>;
  };
  limits: {
    g2_max: number;
    g3_max: number;
  };
}

const SecurityRegionChart: React.FC<SecurityRegionChartProps> = ({ data, limits }) => {
  const getConstraintPoints = (constraint: Constraint) => {
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow">
          <p>({payload[0].payload.x.toFixed(2)}, {payload[0].payload.y.toFixed(2)})</p>
        </div>
      );
    }
    return null;
  };

  const getFeasibleRegionPoints = () => {
    // Filter out duplicates based on x and y values rounded to 4 decimal places
    const uniquePoints = data.feasibleRegion.reduce((acc: any[], point) => {
      const roundedPoint = {
        x: Number(point.x.toFixed(4)),
        y: Number(point.y.toFixed(4)),
        constraint: 'Feasible Region'
      };
      
      const exists = acc.some(p => 
        p.x === roundedPoint.x && 
        p.y === roundedPoint.y
      );
      
      if (!exists) {
        acc.push(roundedPoint);
      }
      return acc;
    }, []);
  
    return uniquePoints;
  };

  return (
    <div className="h-[600px] w-full">
      <ComposedChart
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
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          align="right"
          verticalAlign="top"
          wrapperStyle={{ paddingLeft: '20px' }}
        />

        {/* Shaded feasible region */}
        <Area
          data={getFeasibleRegionPoints()}
          dataKey="y"
          fill="#82ca9d"
          fillOpacity={0.3}
          stroke="none"
          name="Feasible Region"
          type="linear"
          isAnimationActive={false}
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
      </ComposedChart>
    </div>
  );
};

export default SecurityRegionChart;