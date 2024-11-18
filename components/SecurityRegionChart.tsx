import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface Point {
  x: number;
  y: number;
}

interface Constraint {
  coefficients: { a: number; b: number; c: number };
  description: string;
  color: string;
  style: string;
}

interface Props {
  data: { constraints: Constraint[] };
  limits: { g2_max: number; g3_max: number };
}

const SecurityRegionChart: React.FC<Props> = ({ data, limits }) => {
  const getFeasibleRegionPoints = () => {
    const vertices: Point[] = [];
    const constraints = data.constraints;

    // Calculate intersections of all constraint pairs
    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const { a: a1, b: b1, c: c1 } = constraints[i].coefficients;
        const { a: a2, b: b2, c: c2 } = constraints[j].coefficients;

        const det = a1 * b2 - a2 * b1;
        if (Math.abs(det) > 1e-10) {
          const x = (b2 * c1 - b1 * c2) / det;
          const y = (a1 * c2 - a2 * c1) / det;

          if (x >= 0 && x <= limits.g2_max && y >= 0 && y <= limits.g3_max) {
            vertices.push({ x, y });
          }
        }
      }
    }

    // Include corner vertices (boundary conditions)
    vertices.push({ x: 0, y: 0 });
    vertices.push({ x: limits.g2_max, y: 0 });
    vertices.push({ x: 0, y: limits.g3_max });
    vertices.push({ x: limits.g2_max, y: limits.g3_max });

    // Sort vertices in clockwise order to form a closed polygon
    const centroid = vertices.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 }
    );
    centroid.x /= vertices.length;
    centroid.y /= vertices.length;

    vertices.sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return angleA - angleB;
    });

    // Close the polygon
    vertices.push(vertices[0]);
    return vertices;
  };

  const CustomTooltip = ({ active, payload, coordinate }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow">
          <p>Pointer: ({coordinate.x.toFixed(2)}, {coordinate.y.toFixed(2)})</p>
        </div>
      );
    }
    return null;
  };

  const feasibleRegion = getFeasibleRegionPoints();

  return (
    <ComposedChart
      width={800}
      height={600}
      margin={{ top: 20, right: 50, bottom: 60, left: 50 }}
    >
      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
      <XAxis
        type="number"
        domain={[0, limits.g2_max]}
        label={{ value: 'Generator 2 Output (MW)', position: 'bottom', offset: 20 }}
      />
      <YAxis
        type="number"
        domain={[0, limits.g3_max]}
        label={{ value: 'Generator 3 Output (MW)', angle: -90, position: 'left' }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend />

      {/* Shaded Feasible Region */}
      <Area
        type="monotone"
        data={feasibleRegion}
        dataKey="y"
        fill="#82ca9d"
        stroke="#82ca9d"
        fillOpacity={0.3}
        name="Feasible Region"
      />

      {/* Constraint Lines */}
      {data.constraints.map((constraint, index) => {
        const { a, b, c } = constraint.coefficients;
        const points = [
          { x: 0, y: c / b }, // Intersect with Y-axis
          { x: c / a, y: 0 }, // Intersect with X-axis
        ].filter(
          (p) => p.x >= 0 && p.x <= limits.g2_max && p.y >= 0 && p.y <= limits.g3_max
        );

        return (
          <Line
            key={index}
            type="monotone"
            data={points}
            dataKey="y"
            stroke={constraint.color}
            strokeDasharray={constraint.style === 'dashed' ? '5 5' : undefined}
            name={constraint.description}
          />
        );
      })}

      {/* Boundary Lines */}
      <ReferenceLine x={limits.g2_max} stroke="green" label="G2 Max" />
      <ReferenceLine y={limits.g3_max} stroke="green" label="G3 Max" />
    </ComposedChart>
  );
};

export default SecurityRegionChart;