import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../Card';
import { useChartTheme } from '../../utils/chartColors';

const ProductionSummaryChart = ({ data = [], loading }) => {
  const { sequentialHue, text } = useChartTheme();
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Items Produced</h3>
      <p className="text-sm text-gray-600 mb-4">Total quantity produced per item for the selected period</p>
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No production in this period</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={text.grid} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="itemName"
              tick={{ fontSize: 12, fill: text.muted }}
              axisLine={{ stroke: text.grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: text.muted }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value) => [value, 'Quantity']}
              contentStyle={{ fontSize: 13, backgroundColor: text.surface, borderColor: text.grid, color: text.primary }}
            />
            <Bar dataKey="totalQuantity" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.itemName} fill={sequentialHue} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default ProductionSummaryChart;
