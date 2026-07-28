import React from 'react';
import Card from '../Card';

const StatTile = ({ label, value, subtitle }) => (
  <Card>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
    {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
  </Card>
);

export default StatTile;
