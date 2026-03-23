import React from 'react';
import Button from '../Button';

const CustomerDetailsHeader = ({ onBack }) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer details</h1>
        <p className="text-gray-600 mt-1">Profile and finished products sold to this customer</p>
      </div>
      <Button variant="secondary" onClick={onBack}>
        Back to customers
      </Button>
    </div>
  );
};

export default CustomerDetailsHeader;
