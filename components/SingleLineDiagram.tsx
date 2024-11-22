import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoadData {
  bus5: { p: number };
  bus7: { p: number };
  bus9: { p: number };
}

interface NewBranch {
  fromBus: number;
  toBus: number;
  templateBranch: number;
}

interface SingleLineDiagramProps {
  loads: LoadData;
  additionalBranches?: NewBranch[];
}

const SingleLineDiagram: React.FC<SingleLineDiagramProps> = ({ 
  loads, 
  additionalBranches = [] 
}) => {
  // Bus positions with increased spacing
  const busPositions: Record<number, { x: number; y: number }> = {
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
  const GeneratorSymbol: React.FC<{ 
    withLabel: string; 
    isSlack?: boolean;
    labelOffset?: { x: number; y: number };
  }> = ({ 
    withLabel, 
    isSlack = false,
    labelOffset = { x: 0, y: -30 }  // Default offset
  }) => (
    <g>
      <circle r="15" fill="none" stroke="red" strokeWidth="2"/>
      <path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="red" strokeWidth="2"/>
      <text 
        x={labelOffset.x} 
        y={labelOffset.y} 
        textAnchor="middle" 
        fill="red" 
        fontSize="14"
      >
        {withLabel}
      </text>
      {isSlack && (
        <text 
          x={labelOffset.x} 
          y={labelOffset.y - 15} 
          textAnchor="middle" 
          fill="red" 
          fontSize="10"
        >
          (Slack Bus)
        </text>
      )}
    </g>
  );

  // SVG Load Symbol definition (vertical arrow starting from bus circumference)
  const LoadSymbol: React.FC<{ 
    busX: number; 
    busY: number; 
    power: number;
  }> = ({ busX, busY, power }) => {
    const arrowLength = 40;
    return (
      <g transform={`translate(${busX},${busY + BUS_RADIUS})`}>
        <path 
          d={`M0,0 L0,${arrowLength} M-5,${arrowLength-5} L0,${arrowLength} L5,${arrowLength-5}`}
          fill="none" 
          stroke="blue" 
          strokeWidth="2"
        />
        <text 
          y={arrowLength + 15} 
          textAnchor="middle" 
          fill="blue" 
          fontSize="12"
        >
          {power} MW
        </text>
      </g>
    );
  };

  // Function to render transmission lines
  const renderLine = (
    fromBus: number, 
    toBus: number, 
    index: number,
    isNewLine: boolean = false
  ) => {
    const from = busPositions[fromBus];
    const to = busPositions[toBus];
    
    // Calculate midpoint for label
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    
    return (
      <g key={`line-${fromBus}-${toBus}`}>
        <path 
          d={`M ${from.x},${from.y} L ${to.x},${to.y}`}
          stroke={isNewLine ? "purple" : "black"} 
          strokeWidth="2"
          strokeDasharray={isNewLine ? "5,5" : undefined}
        />
        <text 
          x={midX} 
          y={midY - 10} 
          textAnchor="middle" 
          className="text-xs"
          fill={isNewLine ? "purple" : "black"}
        >
          {isNewLine ? 
            `[N${index}] New Line ${fromBus}-${toBus}` : 
            `[${index}] Line ${fromBus}-${toBus}`
          }
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
            <rect width="1000" height="650" fill="url(#grid)" />

            {/* Original transmission lines */}
            <g>
              {renderLine(1, 4, 1)}
              {renderLine(4, 5, 2)}
              {renderLine(5, 6, 3)}
              {renderLine(3, 6, 4)}
              {renderLine(6, 7, 5)}
              {renderLine(7, 8, 6)}
              {renderLine(8, 2, 7)}
              {renderLine(8, 9, 8)}
              {renderLine(9, 4, 9)}
            </g>

            {/* Additional branches */}
            {additionalBranches.map((branch, index) => 
              renderLine(
                branch.fromBus, 
                branch.toBus, 
                index + 1,
                true
              )
            )}

            {/* Generator connection lines */}
            <g stroke="red" strokeWidth="2">
              <line 
                x1={busPositions[1].x} 
                y1={busPositions[1].y - 60} 
                x2={busPositions[1].x} 
                y2={busPositions[1].y - BUS_RADIUS} 
              />
              <line 
                x1={busPositions[2].x} 
                y1={busPositions[2].y - 60} 
                x2={busPositions[2].x} 
                y2={busPositions[2].y - BUS_RADIUS} 
              />
              <line 
                x1={busPositions[3].x} 
                y1={busPositions[3].y + 60} 
                x2={busPositions[3].x} 
                y2={busPositions[3].y + BUS_RADIUS} 
              />
            </g>

            {/* Generators */}
            <g>
              <g transform={`translate(${busPositions[1].x},${busPositions[1].y - 60})`}>
                <GeneratorSymbol 
                  withLabel="G1" 
                  isSlack={true} 
                  labelOffset={{ x: 0, y: -30 }} 
                />
              </g>
              <g transform={`translate(${busPositions[2].x},${busPositions[2].y - 60})`}>
                <GeneratorSymbol 
                  withLabel="G2" 
                  labelOffset={{ x: 0, y: -30 }} 
                />
              </g>
              <g transform={`translate(${busPositions[3].x},${busPositions[3].y + 60})`}>
                <GeneratorSymbol 
                  withLabel="G3" 
                  labelOffset={{ x: 0, y: 30 }} 
                />
              </g>
            </g>

            {/* Buses */}
            {Object.entries(busPositions).map(([bus, pos]) => (
              <g key={bus} transform={`translate(${pos.x},${pos.y})`}>
                <circle 
                  r={BUS_RADIUS} 
                  fill="white" 
                  stroke="black" 
                  strokeWidth="2"
                />
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
            <LoadSymbol 
              busX={busPositions[5].x} 
              busY={busPositions[5].y} 
              power={loads.bus5.p} 
            />
            <LoadSymbol 
              busX={busPositions[7].x} 
              busY={busPositions[7].y} 
              power={loads.bus7.p} 
            />
            <LoadSymbol 
              busX={busPositions[9].x} 
              busY={busPositions[9].y} 
              power={loads.bus9.p} 
            />

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

              <g transform="translate(0,70)">
                <line x1="0" y1="0" x2="30" y2="0" stroke="purple" strokeWidth="2" strokeDasharray="5,5"/>
                <text x="40" y="5" fontSize="12">New Branch</text>
              </g>
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default SingleLineDiagram;