import React from 'react';
import Card from '../Card';

/**
 * Summary stats for the current page of sales.
 * @param {{ summary: { count: number, totalPieces: number, revenue: number } }} props
 */
const CustomerSalesSummaryCards = ({ summary }) => {
  const { count, totalPieces, revenue } = summary || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="!p-4">
        <p className="text-sm text-gray-500">Sales (this page)</p>
        <p className="text-2xl font-bold text-gray-900">{count ?? 0}</p>
      </Card>
      <Card className="!p-4">
        <p className="text-sm text-gray-500">Pieces sold (this page)</p>
        <p className="text-2xl font-bold text-gray-900">{totalPieces ?? 0}</p>
      </Card>
      <Card className="!p-4">
        <p className="text-sm text-gray-500">Total amount (this page)</p>
        <p className="text-2xl font-bold text-gray-900">
          {revenue ? revenue.toLocaleString() : '—'}
        </p>
      </Card>
    </div>
  );
};

export default CustomerSalesSummaryCards;
