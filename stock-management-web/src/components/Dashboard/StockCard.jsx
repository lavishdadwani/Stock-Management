import React, { useState, useEffect, useRef } from 'react';
import Card from '../Card';

const DURATION_MS = 500;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const StockCard = ({ name, quantity, unit, color = 'blue', subtitle = null }) => {
  const [displayValue, setDisplayValue] = useState(quantity);
  const displayValueRef = useRef(quantity);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  displayValueRef.current = displayValue;

  useEffect(() => {
    const target = Number(quantity) || 0;
    const start = displayValueRef.current;
    if (start === target) return;

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(start + (target - start) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [quantity]);

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
            {displayValue.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
          </h2>
          <p className={`${textColorClasses[color]} text-sm`}>{unit}</p>
          {subtitle ? (
            <p className={`${textColorClasses[color]} text-xs mt-2 opacity-90 leading-snug`}>
              {subtitle}
            </p>
          ) : null}
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

