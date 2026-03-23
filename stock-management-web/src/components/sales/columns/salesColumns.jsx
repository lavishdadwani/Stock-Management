import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const getSalesColumns = (onEdit, onDelete) => [
  {
    title: 'Customer',
    key: 'customer',
    render: (_, record) => (
      <div>
        <p className="font-medium">{record.customerId?.name || '-'}</p>
        <p className="text-xs text-gray-500">{record.customerId?.companyName || '-'}</p>
      </div>
    )
  },
  {
    title: 'Item',
    dataIndex: 'itemName',
    key: 'itemName'
  },
  {
    title: 'Quantity',
    key: 'quantity',
    render: (_, record) => `${record.quantity ?? 0} ${record.unit || 'pieces'}`
  },
  {
    title: 'Price/Piece',
    dataIndex: 'pricePerPiece',
    key: 'pricePerPiece',
    render: (value) => (value === null || value === undefined ? '-' : value)
  },
  {
    title: 'Total',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    render: (value) => (value === null || value === undefined ? '-' : value)
  },
  {
    title: 'Sold By',
    key: 'soldBy',
    render: (_, record) => record.soldBy?.name || '-'
  },
  {
    title: 'Sale Date',
    dataIndex: 'saleDate',
    key: 'saleDate',
    render: (value) => (value ? new Date(value).toLocaleString() : '-')
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(record)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Edit sale"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(record._id)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Delete sale"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    )
  }
];

