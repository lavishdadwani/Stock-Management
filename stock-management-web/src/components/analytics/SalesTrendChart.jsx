import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../Card';
import { useChartTheme } from '../../utils/chartColors';

const formatCurrency = (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const SalesTrendChart = ({ data = [], loading }) => {
  const { sequentialHue, text } = useChartTheme();
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Sales Revenue Trend</h3>
      <p className="text-sm text-gray-600 mb-4">Daily revenue for the selected period</p>
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No sales in this period</div>
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
              tickFormatter={formatCurrency}
              width={64}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              contentStyle={{ fontSize: 13, backgroundColor: text.surface, borderColor: text.grid, color: text.primary }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={sequentialHue}
              strokeWidth={2}
              dot={{ r: 4, fill: sequentialHue, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default SalesTrendChart;
