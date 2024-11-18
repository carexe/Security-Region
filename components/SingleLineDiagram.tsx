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
  // SVG Generator Symbol definitions
  const GeneratorSymbol = ({ withLabel, isSlack = false }: { withLabel: string, isSlack?: boolean }) => (
    <g>
      {/* Generator circle and X */}
      <circle r="15" fill="none" stroke="red" strokeWidth="2"/>
      <path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="red" strokeWidth="2"/>
      
      {/* Label */}
      <text y="-25" textAnchor="middle" fill="red" fontSize="14">{withLabel}</text>
      {isSlack && (
        <text y="-40" textAnchor="middle" fill="red" fontSize="10">(Slack Bus)</text>
      )}
    </g>
  );

  // SVG Load Symbol definition (vertical arrow)
  const LoadSymbol = ({ power }: { power: number }) => (
    <g>
      <path 
        d="M0,0 L0,30 M-5,25 L0,30 L5,25" 
        fill="none" 
        stroke="blue" 
        strokeWidth="2"
      />
      <text y="45" textAnchor="middle" fill="blue" fontSize="12">
        {power} MW
      </text>
    </g>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>IEEE 9-Bus System Single Line Diagram</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[600px]">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#grid)" />

            {/* Transmission lines */}
            <g stroke="black" strokeWidth="2">
              <path d="M 200,150 L 200,250" />
              <path d="M 200,250 L 300,350" />
              <path d="M 300,350 L 400,350" />
              <path d="M 400,450 L 400,350" />
              <path d="M 400,350 L 500,350" />
              <path d="M 500,350 L 600,250" />
              <path d="M 600,250 L 600,150" />
              <path d="M 600,250 L 400,250" />
              <path d="M 400,250 L 200,250" />
            </g>

            {/* Line labels */}
            <g className="text-xs">
              <text x="180" y="200" textAnchor="end">[1] Line 1-4</text>
              <text x="230" y="320" textAnchor="start" transform="rotate(-45 230,320)">[2] Line 4-5</text>
              <text x="350" y="370" textAnchor="middle">[3] Line 5-6</text>
              <text x="420" y="420" textAnchor="start">[4] Line 3-6</text>
              <text x="450" y="370" textAnchor="middle">[5] Line 6-7</text>
              <text x="570" y="320" textAnchor="end" transform="rotate(45 570,320)">[6] Line 7-8</text>
              <text x="620" y="200" textAnchor="start">[7] Line 8-2</text>
              <text x="500" y="240" textAnchor="middle">[8] Line 8-9</text>
              <text x="300" y="240" textAnchor="middle">[9] Line 9-4</text>
            </g>

            {/* Generator connection lines */}
            <g stroke="red" strokeWidth="2">
              <line x1="200" y1="90" x2="200" y2="130" /> {/* G1 connection */}
              <line x1="600" y1="90" x2="600" y2="130" /> {/* G2 connection */}
              <line x1="400" y1="510" x2="400" y2="470" /> {/* G3 connection */}
            </g>

            {/* Load connection lines */}
            <g stroke="blue" strokeWidth="2">
              <line x1="300" y1="370" x2="300" y2="390" /> {/* Load 5 connection */}
              <line x1="500" y1="370" x2="500" y2="390" /> {/* Load 7 connection */}
              <line x1="400" y1="270" x2="400" y2="290" /> {/* Load 9 connection */}
            </g>

            {/* Generators */}
            <g>
              <g transform="translate(200,70)">
                <GeneratorSymbol withLabel="G1" isSlack={true} />
              </g>
              <g transform="translate(600,70)">
                <GeneratorSymbol withLabel="G2" />
              </g>
              <g transform="translate(400,530)">
                <GeneratorSymbol withLabel="G3" />
              </g>
            </g>

            {/* Buses */}
            <g>
              {/* Bus circles and numbers */}
              {[
                { x: 200, y: 150, n: "1" },
                { x: 600, y: 150, n: "2" },
                { x: 400, y: 450, n: "3" },
                { x: 200, y: 250, n: "4" },
                { x: 300, y: 350, n: "5" },
                { x: 400, y: 350, n: "6" },
                { x: 500, y: 350, n: "7" },
                { x: 600, y: 250, n: "8" },
                { x: 400, y: 250, n: "9" }
              ].map(bus => (
                <g key={bus.n} transform={`translate(${bus.x},${bus.y})`}>
                  <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                  <text 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fontSize="16"
                  >
                    {bus.n}
                  </text>
                </g>
              ))}
            </g>

            {/* Loads */}
            <g>
              <g transform="translate(300,390)">
                <LoadSymbol power={loads.bus5.p} />
              </g>
              <g transform="translate(500,390)">
                <LoadSymbol power={loads.bus7.p} />
              </g>
              <g transform="translate(400,290)">
                <LoadSymbol power={loads.bus9.p} />
              </g>
            </g>

            {/* Legend */}
            <g transform="translate(650,500)">
              <text y="-80" fontSize="14" fontWeight="bold">Legend</text>
              
              {/* Generator symbol */}
              <g transform="translate(0,-50)">
                <g transform="scale(0.8)">
                  <circle r="15" fill="none" stroke="red" strokeWidth="2"/>
                  <path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="red" strokeWidth="2"/>
                </g>
                <text x="30" y="5" fontSize="12">Generator</text>
              </g>
              
              {/* Load symbol */}
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

              {/* Bus symbol */}
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