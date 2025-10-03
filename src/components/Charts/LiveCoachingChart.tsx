import React from 'react';

interface MetricDataPoint {
  timestamp: number;
  confidence: number;
  pace: number;
  volume: number;
  stress: number;
  energy: number;
}

interface LiveCoachingChartProps {
  data: MetricDataPoint[];
  isRecording: boolean;
  duration: number;
}

export const LiveCoachingChart: React.FC<LiveCoachingChartProps> = ({
  data,
  isRecording,
  duration
}) => {
  // Calculate chart dimensions
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;
  const innerWidth = chartWidth - (padding * 2);
  const innerHeight = chartHeight - (padding * 2);

  // Create time scale (x-axis)
  const maxTime = Math.max(duration, 30); // At least 30 seconds
  const timeScale = (time: number) => (time / maxTime) * innerWidth + padding;

  // Create value scale (y-axis) - 0 to 100
  const valueScale = (value: number) => chartHeight - padding - (value / 100) * innerHeight;

  // Generate path for each metric
  const generatePath = (metric: keyof Omit<MetricDataPoint, 'timestamp'>) => {
    if (data.length === 0) return '';

    return data
      .map((point, index) => {
        const x = timeScale(point.timestamp);
        const y = valueScale(point[metric]);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Current values (last data point)
  const currentValues = data.length > 0 ? data[data.length - 1] : null;

  const metrics = [
    { key: 'confidence', label: 'Confidence', color: '#10B981', target: 80 },
    { key: 'pace', label: 'Pace', color: '#3B82F6', target: 75 },
    { key: 'energy', label: 'Energy', color: '#F59E0B', target: 70 },
    { key: 'volume', label: 'Volume', color: '#8B5CF6', target: 65 },
  ] as const;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📈 Voice Performance Timeline
        </h3>
        {isRecording && (
          <div className="flex items-center text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {metrics.map(({ key, label, color, target }) => {
          const currentValue = currentValues?.[key] || 0;
          const isGood = currentValue >= target;

          return (
            <div key={key} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div
                className={`text-lg font-bold mb-1 ${isGood ? 'text-green-600' : 'text-orange-600'}`}
                style={{ color: isGood ? color : '#F97316' }}
              >
                {Math.round(currentValue)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, currentValue)}%`,
                    backgroundColor: color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="border rounded">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map(value => (
            <g key={value}>
              <line
                x1={padding}
                y1={valueScale(value)}
                x2={chartWidth - padding}
                y2={valueScale(value)}
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
              <text
                x={padding - 5}
                y={valueScale(value) + 3}
                textAnchor="end"
                fontSize="10"
                fill="#6B7280"
              >
                {value}%
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {Array.from({ length: Math.ceil(maxTime / 10) + 1 }, (_, i) => i * 10).map(time => (
            <g key={time}>
              <line
                x1={timeScale(time)}
                y1={padding}
                x2={timeScale(time)}
                y2={chartHeight - padding}
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
              <text
                x={timeScale(time)}
                y={chartHeight - padding + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#6B7280"
              >
                {time}s
              </text>
            </g>
          ))}

          {/* Metric lines */}
          {metrics.map(({ key, color }) => (
            <path
              key={key}
              d={generatePath(key)}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current position indicator */}
          {isRecording && currentValues && (
            <line
              x1={timeScale(currentValues.timestamp)}
              y1={padding}
              x2={timeScale(currentValues.timestamp)}
              y2={chartHeight - padding}
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2">
          {metrics.map(({ key, label, color }) => (
            <div key={key} className="flex items-center">
              <div
                className="w-3 h-0.5 mr-2"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching Tips */}
      {currentValues && (
        <div className="mt-4 text-sm">
          {currentValues.confidence < 60 && (
            <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-2">
              <span className="text-orange-700">💪 Speak with more confidence - project your voice</span>
            </div>
          )}
          {currentValues.pace > 90 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
              <span className="text-blue-700">🐌 Slow down your pace for better clarity</span>
            </div>
          )}
          {currentValues.pace < 50 && (
            <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
              <span className="text-green-700">⚡ Increase your speaking pace to maintain engagement</span>
            </div>
          )}
          {currentValues.energy < 50 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
              <span className="text-yellow-700">🔥 Add more energy and enthusiasm to your delivery</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveCoachingChart;