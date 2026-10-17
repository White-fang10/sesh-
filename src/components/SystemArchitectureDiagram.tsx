import React from 'react';

interface SystemArchitectureDiagramProps {
  isDarkMode?: boolean;
}

export const SystemArchitectureDiagram: React.FC<SystemArchitectureDiagramProps> = ({
  isDarkMode = false,
}) => {
  const boxBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const boxBorder = isDarkMode ? '#475569' : '#CBD5E1';
  const textColor = isDarkMode ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDarkMode ? '#94A3B8' : '#64748B';
  const arrowColor = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <div className="w-full my-2 p-2.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
      <svg
        viewBox="0 0 340 160"
        className="w-full h-auto select-none overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id={`arrow-${isDarkMode ? 'dark' : 'light'}`}
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 6 3 L 0 6 z" fill={arrowColor} />
          </marker>
        </defs>

        {/* User Node */}
        <g transform="translate(10, 48)">
          <rect
            width="50"
            height="32"
            rx="6"
            fill={boxBg}
            stroke={boxBorder}
            strokeWidth="1.2"
          />
          <text
            x="25"
            y="20"
            textAnchor="middle"
            fill={textColor}
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            User
          </text>
        </g>

        {/* Arrow: User -> Frontend */}
        <path
          d="M60 64 L98 64"
          stroke={arrowColor}
          strokeWidth="1.2"
          markerEnd={`url(#arrow-${isDarkMode ? 'dark' : 'light'})`}
        />

        {/* Arrow & Label: Upload Docs */}
        <path
          d="M35 80 L35 110 L100 110"
          stroke={arrowColor}
          strokeWidth="1.2"
          markerEnd={`url(#arrow-${isDarkMode ? 'dark' : 'light'})`}
        />
        <text
          x="42"
          y="105"
          fill={subtextColor}
          fontSize="7.5"
          fontFamily="Inter, sans-serif"
        >
          Upload Docs
        </text>

        {/* Frontend (Next.js) */}
        <g transform="translate(100, 40)">
          <rect
            width="65"
            height="46"
            rx="6"
            fill={boxBg}
            stroke={boxBorder}
            strokeWidth="1.2"
          />
          <text
            x="32.5"
            y="21"
            textAnchor="middle"
            fill={textColor}
            fontSize="9"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            Frontend
          </text>
          <text
            x="32.5"
            y="35"
            textAnchor="middle"
            fill={subtextColor}
            fontSize="8"
            fontFamily="Inter, sans-serif"
          >
            (Next.js)
          </text>
        </g>

        {/* Arrow: Frontend -> Backend */}
        <path
          d="M165 64 L198 64"
          stroke={arrowColor}
          strokeWidth="1.2"
          markerEnd={`url(#arrow-${isDarkMode ? 'dark' : 'light'})`}
        />

        {/* Backend (FastAPI) */}
        <g transform="translate(200, 40)">
          <rect
            width="65"
            height="46"
            rx="6"
            fill={boxBg}
            stroke={boxBorder}
            strokeWidth="1.2"
          />
          <text
            x="32.5"
            y="21"
            textAnchor="middle"
            fill={textColor}
            fontSize="9"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            Backend
          </text>
          <text
            x="32.5"
            y="35"
            textAnchor="middle"
            fill={subtextColor}
            fontSize="8"
            fontFamily="Inter, sans-serif"
          >
            (FastAPI)
          </text>
        </g>

        {/* Arrow: Backend -> DB */}
        <path
          d="M265 60 L293 60"
          stroke={arrowColor}
          strokeWidth="1.2"
          markerEnd={`url(#arrow-${isDarkMode ? 'dark' : 'light'})`}
        />

        {/* Database Cylinder */}
        <g transform="translate(295, 34)">
          <path
            d="M0 8 C0 3, 35 3, 35 8 L35 36 C35 41, 0 41, 0 36 Z"
            fill={boxBg}
            stroke={boxBorder}
            strokeWidth="1.2"
          />
          <ellipse
            cx="17.5"
            cy="8"
            rx="17.5"
            ry="5"
            fill={boxBg}
            stroke={boxBorder}
            strokeWidth="1.2"
          />
          <text
            x="17.5"
            y="22"
            textAnchor="middle"
            fill={textColor}
            fontSize="8.5"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            DB
          </text>
          <text
            x="17.5"
            y="32"
            textAnchor="middle"
            fill={subtextColor}
            fontSize="7"
            fontFamily="Inter, sans-serif"
          >
            (SQLite)
          </text>
        </g>

        {/* Arrow: Backend -> Claude / LLM */}
        <path
          d="M232 86 L232 125 L248 125"
          stroke={arrowColor}
          strokeWidth="1.2"
          markerEnd={`url(#arrow-${isDarkMode ? 'dark' : 'light'})`}
        />

        {/* Claude / LLM */}
        <g transform="translate(250, 108)">
          <rect
            width="65"
            height="34"
            rx="6"
            fill={boxBg}
            stroke={boxBorder}
            strokeWidth="1.2"
          />
          <text
            x="32.5"
            y="22"
            textAnchor="middle"
            fill={textColor}
            fontSize="8.5"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            Claude / LLM
          </text>
        </g>
      </svg>
    </div>
  );
};
