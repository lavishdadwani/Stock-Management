import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../Card';
import { useChartTheme } from '../../utils/chartColors';

const MATERIALS = [
  { key: 'aluminium', label: 'Aluminium' },
  { key: 'copper', label: 'Copper' },
  { key: 'scrap', label: 'Scrap' }
];

const MaterialUsageChart = ({ data = [], loading }) => {
  const { materialColors, text } = useChartTheme();
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Material Usage (Transfers)</h3>
      <p className="text-sm text-gray-600 mb-4">Daily kg transferred per material for the selected period</p>
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No transfers in this period</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={text.grid} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: text.muted }}
              axisLine={{ stroke: text.grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: text.muted }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}kg`}
              width={64}
            />
            <Tooltip
              formatter={(value, name) => [`${value} kg`, name]}
              contentStyle={{ fontSize: 13, backgroundColor: text.surface, borderColor: text.grid, color: text.primary }}
            />
            <Legend wrapperStyle={{ fontSize: 13, color: text.secondary }} />
            {MATERIALS.map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={materialColors[m.key]}
                strokeWidth={2}
                dot={{ r: 4, fill: materialColors[m.key], strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default MaterialUsageChart;
