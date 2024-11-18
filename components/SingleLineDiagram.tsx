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
  const GeneratorSymbol = () => (
    <g>
      <circle r="15" fill="none" stroke="red" strokeWidth="2"/>
      <path d="M-7,-7 L7,7 M-7,7 L7,-7" stroke="red" strokeWidth="2"/>
    </g>
  );

  // SVG Load Symbol definition
  const LoadSymbol = ({ power }: { power: number }) => (
    <g>
      <path d="M-10,0 L10,0 M0,0 L0,15 L-10,30 M0,15 L10,30" 
            fill="none" stroke="blue" strokeWidth="2"/>
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

            {/* Transmission lines with labels */}
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
              <text x="180" y="200" textAnchor="end">Line 1-4</text>
              <text x="230" y="320" textAnchor="start" transform="rotate(-45 230,320)">Line 4-5</text>
              <text x="350" y="370" textAnchor="middle">Line 5-6</text>
              <text x="420" y="420" textAnchor="start">Line 3-6</text>
              <text x="450" y="370" textAnchor="middle">Line 6-7</text>
              <text x="570" y="320" textAnchor="end" transform="rotate(45 570,320)">Line 7-8</text>
              <text x="620" y="200" textAnchor="start">Line 8-2</text>
              <text x="500" y="240" textAnchor="middle">Line 8-9</text>
              <text x="300" y="240" textAnchor="middle">Line 9-4</text>
            </g>

            {/* Buses */}
            <g>
              {/* Bus 1 */}
              <g transform="translate(200,150)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">1</text>
                <g transform="translate(-30,-30)">
                  <GeneratorSymbol />
                  <text x="0" y="-25" textAnchor="middle" fill="red">G1</text>
                </g>
              </g>

              {/* Bus 2 */}
              <g transform="translate(600,150)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">2</text>
                <g transform="translate(-30,-30)">
                  <GeneratorSymbol />
                  <text x="0" y="-25" textAnchor="middle" fill="red">G2</text>
                </g>
              </g>

              {/* Bus 3 */}
              <g transform="translate(400,450)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">3</text>
                <g transform="translate(-30,-30)">
                  <GeneratorSymbol />
                  <text x="0" y="-25" textAnchor="middle" fill="red">G3</text>
                </g>
              </g>

              {/* Bus 4 */}
              <g transform="translate(200,250)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">4</text>
              </g>

              {/* Bus 5 with load */}
              <g transform="translate(300,350)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">5</text>
                <g transform="translate(0,30)">
                  <LoadSymbol power={loads.bus5.p} />
                </g>
              </g>

              {/* Bus 6 */}
              <g transform="translate(400,350)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">6</text>
              </g>

              {/* Bus 7 with load */}
              <g transform="translate(500,350)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">7</text>
                <g transform="translate(0,30)">
                  <LoadSymbol power={loads.bus7.p} />
                </g>
              </g>

              {/* Bus 8 */}
              <g transform="translate(600,250)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">8</text>
              </g>

              {/* Bus 9 with load */}
              <g transform="translate(400,250)">
                <circle r="20" fill="white" stroke="black" strokeWidth="2"/>
                <text textAnchor="middle" dominantBaseline="middle" fontSize="16">9</text>
                <g transform="translate(0,30)">
                  <LoadSymbol power={loads.bus9.p} />
                </g>
              </g>
            </g>

            {/* Legend */}
            <g transform="translate(650,500)">
              <text y="-80" fontSize="14" fontWeight="bold">Legend</text>
              
              {/* Generator symbol */}
              <g transform="translate(0,-50)">
                <g transform="scale(0.8)">
                  <GeneratorSymbol />
                </g>
                <text x="30" y="5" fontSize="12">Generator</text>
              </g>
              
              {/* Load symbol */}
              <g transform="translate(0,-10)">
                <g transform="scale(0.8)">
                  <path d="M-10,0 L10,0 M0,0 L0,15 L-10,30 M0,15 L10,30" 
                        fill="none" stroke="blue" strokeWidth="2"/>
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