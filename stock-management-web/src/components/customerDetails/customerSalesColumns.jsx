import React from 'react';

/** Sales table for a single customer (no customer column). */
export const getCustomerSalesColumns = () => [
  {
    title: 'Finished product',
    dataIndex: 'itemName',
    key: 'itemName'
  },
  {
    title: 'Quantity',
    key: 'quantity',
    render: (_, record) => `${record.quantity ?? 0} ${record.unit || 'pieces'}`
  },
  {
    title: 'Price / piece',
    dataIndex: 'pricePerPiece',
    key: 'pricePerPiece',
    render: (value) =>
      value === null || value === undefined ? '—' : Number(value).toLocaleString()
  },
  {
    title: 'Total',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: (value) =>
      value === null || value === undefined ? '—' : Number(value).toLocaleString()
  },
  {
    title: 'Sold by',
    key: 'soldBy',
    render: (_, record) => record.soldBy?.name || '—'
  },
  {
    title: 'Sale date',
    dataIndex: 'saleDate',
    key: 'saleDate',
    render: (value) => (value ? new Date(value).toLocaleString() : '—')
  },
  {
    title: 'Notes',
    dataIndex: 'notes',
    key: 'notes',
    render: (value) => value || '—'
  }
];
