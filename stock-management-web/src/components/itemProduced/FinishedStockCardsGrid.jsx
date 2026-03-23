import React from 'react';
import StockCard from '../Dashboard/StockCard';

const colorPalette = ['blue', 'orange', 'green', 'purple'];

const FinishedStockCardsGrid = ({ totals = [], loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (!totals.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {totals.map((item, index) => {
        const produced = item.producedQuantity ?? null;
        const purchased = item.purchasedQuantity ?? null;
        const hasSplit =
          produced !== null &&
          purchased !== null &&
          (produced > 0 || purchased > 0);
        const subtitle = hasSplit
          ? `Produced: ${Number(produced).toLocaleString()} · Purchased: ${Number(purchased).toLocaleString()}`
          : null;
        return (
          <StockCard
            key={item.name}
            name={item.name}
            quantity={item.quantity}
            unit={item.unit || 'pieces'}
            color={colorPalette[index % colorPalette.length]}
            subtitle={subtitle}
          />
        );
      })}
    </div>
  );
};

export default FinishedStockCardsGrid;

