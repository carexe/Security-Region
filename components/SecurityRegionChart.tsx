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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { x, y } = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow">
          <p><strong>Coordinates:</strong></p>
          <p>x: {x.toFixed(2)} MW</p>
          <p>y: {y.toFixed(2)} MW</p>
        </div>
      );
    }
    return null;
  };

  const getFeasibleRegionPoints = () => {
    const points: Point[] = [];
    const constraints = data.constraints;
    
    // Add vertices at constraint intersections
    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const c1 = constraints[i].coefficients;
        const c2 = constraints[j].coefficients;
        
        const det = c1.a * c2.b - c2.a * c1.b;
        if (Math.abs(det) > 1e-10) {
          const x = (c1.c * c2.b - c2.c * c1.b) / det;
          const y = (c1.a * c2.c - c2.a * c1.c) / det;
          
          if (x >= 0 && x <= limits.g2_max && y >= 0 && y <= limits.g3_max) {
            // Check if point satisfies all constraints
            let feasible = true;
            for (const c of constraints) {
              if (c.coefficients.a * x + c.coefficients.b * y > c.coefficients.c + 1e-10) {
                feasible = false;
                break;
              }
            }
            if (feasible) {
              points.push({ x, y, constraint: 'Feasible Region' });
            }
          }
        }
      }
    }

    // Add boundary points
    points.push({ x: 0, y: 0, constraint: 'Feasible Region' });
    points.push({ x: limits.g2_max, y: 0, constraint: 'Feasible Region' });
    points.push({ x: 0, y: limits.g3_max, constraint: 'Feasible Region' });
    points.push({ x: limits.g2_max, y: limits.g3_max, constraint: 'Feasible Region' });

    // Sort points clockwise around centroid
    const centroid = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };

    points.sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return angleA - angleB;
    });

    // Close the polygon
    if (points.length > 0) {
      points.push({ ...points[0] });
    }

    return points;
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