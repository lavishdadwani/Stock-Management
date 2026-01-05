import React from 'react';
import StockCard from './StockCard';

const StockCardsGrid = ({ stockData }) => {
  // Color palette for stock cards (cycles through if more than 4 items)
  const colorPalette = ['blue', 'orange', 'green', 'purple'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Object.entries(stockData).map(([key, stock], index) => (
        <StockCard
          key={key}
          name={stock.name}
          quantity={stock.quantity}
          unit={stock.unit}
          color={colorPalette[index % colorPalette.length]}
        />
      ))}
    </div>
  );
};

export default StockCardsGrid;

