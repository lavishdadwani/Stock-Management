import React from 'react';
import StockCardsGrid from '../StockCardsGrid';
import QuickActions from '../QuickActions';

const OwnerDashboardView = () => {
  // Dummy stock data
  const stockData = {
    aluminiumWire: {
      name: 'Aluminium Wire',
      quantity: 1250,
      unit: 'kg',
    },
    copperWire: {
      name: 'Copper Wire',
      quantity: 890,
      unit: 'kg',
    },
    scrap: {
      name: 'Scrap',
      quantity: 450,
      unit: 'kg',
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Stock overview and management</p>
      </div>

      {/* Stock Cards */}
      <StockCardsGrid stockData={stockData} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default OwnerDashboardView;

