import React from 'react';
import Card from '../Card';

/**
 * Customer profile / contact details grid.
 * @param {{ customer: object }} props
 */
const CustomerProfileCard = ({ customer }) => {
  if (!customer) return null;

  return (
    <Card className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{customer.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-gray-500">Company</p>
          <p className="font-medium text-gray-900">{customer.companyName || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium text-gray-900">{customer.phone ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium text-gray-900 break-all">{customer.email || '—'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium text-gray-900">{customer.address || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">GST</p>
          <p className="font-medium text-gray-900">{customer.gstNumber || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {customer.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Created by</p>
          <p className="font-medium text-gray-900">{customer.createdBy?.name || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Created at</p>
          <p className="font-medium text-gray-900">
            {customer.createdAt ? new Date(customer.createdAt).toLocaleString() : '—'}
          </p>
        </div>
        {customer.notes ? (
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="font-medium text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default CustomerProfileCard;
