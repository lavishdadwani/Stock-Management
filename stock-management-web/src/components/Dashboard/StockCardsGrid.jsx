import React, { useState, useEffect } from 'react';
import StockCard from './StockCard';

const StockCardsGrid = ({ stockQuantities, loading: parentLoading = false }) => {
  const [loading, setLoading] = useState(true);

  const colorPalette = ['blue', 'orange', 'green'];

  useEffect(() => {
    if (stockQuantities) {
      setLoading(false);
    }
  }, [stockQuantities]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
        ))}
      </div>
    );
  }


  const stockItems = [
    stockQuantities.aluminium,
    stockQuantities.copper,
    stockQuantities.scrap,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stockItems.map((stock, index) => (
        <StockCard
          key={stock.name}
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

