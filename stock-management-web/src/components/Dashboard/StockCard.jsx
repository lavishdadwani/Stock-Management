import React from 'react';
import Card from '../Card';

const StockCard = ({ name, quantity, unit, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  };

  const textColorClasses = {
    blue: 'text-blue-100',
    orange: 'text-orange-100',
    green: 'text-green-100',
    purple: 'text-purple-100',
  };

  return (
    <Card className={`${colorClasses[color]} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColorClasses[color]} text-sm font-medium mb-1`}>
            {name}
          </p>
          <h2 className="text-4xl font-bold mb-2">
            {quantity.toLocaleString()}
          </h2>
          <p className={`${textColorClasses[color]} text-sm`}>{unit}</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full p-4">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
};

export default StockCard;

