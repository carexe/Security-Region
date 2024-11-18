import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SingleLineDiagramProps {
  loads: {
    bus5: { p: number };
    bus7: { p: number };
    bus9: { p: number };
  };
}

const SingleLineDiagram: React.FC<SingleLineDiagramProps> = ({ loads }) => {
  // Bus positions with increased spacing
  const busPositions = {
    1: { x: 200, y: 250 },
    2: { x: 800, y: 250 },
    3: { x: 500, y: 550 },
    4: { x: 350, y: 250 },
    5: { x: 350, y: 400 },
    6: { x: 500, y: 400 },
    7: { x: 650, y: 400 },
    8: { x: 650, y: 250 },
    9: { x: 500, y: 250 }
  };

  const BUS_RADIUS = 20;  // Radius of bus circles

  // SVG Generator Symbol definitions
  const GeneratorSymbol = ({ withLabel, isSlack = false }: { withLabel: string, isSlack?: boolean }) => (
    <g>
      <circle r="15" fill="none" stroke="red" strokeWidth="2"/>
      <path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="red" strokeWidth="2"/>
      {/* Moved labels up by adjusting y values */}
      <text y="-30" textAnchor="middle" fill="red" fontSize="14">{withLabel}</text>
      {isSlack && (
        <text y="-45" textAnchor="middle" fill="red" fontSize="10">(Slack Bus)</text>
      )}
    </g>
  );

  // SVG Load Symbol definition (vertical arrow starting from bus circumference)
  const LoadSymbol = ({ busX, busY, power }: { busX: number, busY: number, power: number }) => {
    const arrowLength = 40;
    return (
      <g transform={`translate(${busX},${busY + BUS_RADIUS})`}>
        <path 
          d={`M0,0 L0,${arrowLength} M-5,${arrowLength-5} L0,${arrowLength} L5,${arrowLength-5}`}
          fill="none" 
          stroke="blue" 
          strokeWidth="2"
        />
        <text y={arrowLength + 15} textAnchor="middle" fill="blue" fontSize="12">
          {power} MW
        </text>
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>IEEE 9-Bus System Single Line Diagram</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[700px]">
          <svg viewBox="0 0 1000 650" className="w-full h-full">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="800" height="650" fill="url(#grid)" />

            {/* Transmission lines */}
            <g stroke="black" strokeWidth="2">
              {/* Vertical and horizontal lines */}
              <path d={`M ${busPositions[1].x},${busPositions[1].y} L ${busPositions[4].x},${busPositions[4].y}`} />
              <path d={`M ${busPositions[4].x},${busPositions[4].y} L ${busPositions[5].x},${busPositions[5].y}`} />
              <path d={`M ${busPositions[5].x},${busPositions[5].y} L ${busPositions[6].x},${busPositions[6].y}`} />
              <path d={`M ${busPositions[3].x},${busPositions[3].y} L ${busPositions[6].x},${busPositions[6].y}`} />
              <path d={`M ${busPositions[6].x},${busPositions[6].y} L ${busPositions[7].x},${busPositions[7].y}`} />
              <path d={`M ${busPositions[7].x},${busPositions[7].y} L ${busPositions[8].x},${busPositions[8].y}`} />
              <path d={`M ${busPositions[8].x},${busPositions[8].y} L ${busPositions[2].x},${busPositions[2].y}`} />
              <path d={`M ${busPositions[8].x},${busPositions[8].y} L ${busPositions[9].x},${busPositions[9].y}`} />
              <path d={`M ${busPositions[9].x},${busPositions[9].y} L ${busPositions[4].x},${busPositions[4].y}`} />
            </g>

            {/* Line labels */}
            <g className="text-xs">
              <text x={(busPositions[1].x + busPositions[4].x) / 2} y={busPositions[1].y - 10} textAnchor="middle">[1] Line 1-4</text>
              <text x={busPositions[4].x + 10} y={(busPositions[4].y + busPositions[5].y) / 2} textAnchor="start">[2] Line 4-5</text>
              <text x={(busPositions[5].x + busPositions[6].x) / 2} y={busPositions[5].y - 10} textAnchor="middle">[3] Line 5-6</text>
              <text x={busPositions[6].x + 10} y={(busPositions[6].y + busPositions[3].y) / 2} textAnchor="start">[4] Line 3-6</text>
              <text x={(busPositions[6].x + busPositions[7].x) / 2} y={busPositions[6].y - 10} textAnchor="middle">[5] Line 6-7</text>
              <text x={busPositions[7].x + 10} y={(busPositions[7].y + busPositions[8].y) / 2} textAnchor="start">[6] Line 7-8</text>
              <text x={(busPositions[8].x + busPositions[2].x) / 2} y={busPositions[8].y - 10} textAnchor="middle">[7] Line 8-2</text>
              <text x={(busPositions[8].x + busPositions[9].x) / 2} y={busPositions[8].y - 10} textAnchor="middle">[8] Line 8-9</text>
              <text x={(busPositions[4].x + busPositions[9].x) / 2} y={busPositions[4].y - 10} textAnchor="middle">[9] Line 9-4</text>
            </g>

            {/* Generator connection lines */}
            <g stroke="red" strokeWidth="2">
              <line x1={busPositions[1].x} y1={busPositions[1].y - 60} x2={busPositions[1].x} y2={busPositions[1].y - BUS_RADIUS} />
              <line x1={busPositions[2].x} y1={busPositions[2].y - 60} x2={busPositions[2].x} y2={busPositions[2].y - BUS_RADIUS} />
              <line x1={busPositions[3].x} y1={busPositions[3].y + 60} x2={busPositions[3].x} y2={busPositions[3].y + BUS_RADIUS} />
            </g>

            {/* Generators */}
            <g>
              <g transform={`translate(${busPositions[1].x},${busPositions[1].y - 60})`}>
                <GeneratorSymbol withLabel="G1" isSlack={true} />
              </g>
              <g transform={`translate(${busPositions[2].x},${busPositions[2].y - 60})`}>
                <GeneratorSymbol withLabel="G2" />
              </g>
              <g transform={`translate(${busPositions[3].x},${busPositions[3].y + 60})`}>
                <GeneratorSymbol withLabel="G3" />
              </g>
            </g>

            {/* Buses */}
            {Object.entries(busPositions).map(([bus, pos]) => (
              <g key={bus} transform={`translate(${pos.x},${pos.y})`}>
                <circle r={BUS_RADIUS} fill="white" stroke="black" strokeWidth="2"/>
                <text 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fontSize="16"
                >
                  {bus}
                </text>
              </g>
            ))}

            {/* Loads */}
            <LoadSymbol busX={busPositions[5].x} busY={busPositions[5].y} power={loads.bus5.p} />
            <LoadSymbol busX={busPositions[7].x} busY={busPositions[7].y} power={loads.bus7.p} />
            <LoadSymbol busX={busPositions[9].x} busY={busPositions[9].y} power={loads.bus9.p} />

            {/* Legend */}
            <g transform="translate(850,500)">
              <text y="-80" fontSize="14" fontWeight="bold">Legend</text>
              
              <g transform="translate(0,-50)">
                <g transform="scale(0.8)">
                  <circle r="15" fill="none" stroke="red" strokeWidth="2"/>
                  <path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="red" strokeWidth="2"/>
                </g>
                <text x="30" y="5" fontSize="12">Generator</text>
              </g>
              
              <g transform="translate(0,-10)">
                <g transform="scale(0.8)">
                  <path 
                    d="M0,0 L0,30 M-5,25 L0,30 L5,25" 
                    fill="none" 
                    stroke="blue" 
                    strokeWidth="2"
                  />
                </g>
                <text x="30" y="15" fontSize="12">Load</text>
              </g>

              <g transform="translate(0,30)">
                <circle r="10" fill="white" stroke="black" strokeWidth="2"/>
                <text x="30" y="5" fontSize="12">Bus</text>
              </g>
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default SingleLineDiagram;