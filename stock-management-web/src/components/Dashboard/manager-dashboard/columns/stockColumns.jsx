import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const getStockColumns = (onEdit, onDelete) => [
  {
    title: 'Item Name',
    dataIndex: 'itemName',
    key: 'itemName',
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    render: (value, record) => (
      <span>
        {value.toLocaleString()} {record.unit}
      </span>
    ),
  },
  {
    title: 'Stock Type',
    dataIndex: 'stockType',
    key: 'stockType',
    render: (value, record) => {
      // Support both stockType and category for backward compatibility
      const stockType = value || record.category || '-';
      return (
        <span className="font-medium">
          {stockType}
        </span>
      );
    },
  },
  {
    title: 'Added By',
    dataIndex: 'addedBy',
    key: 'addedBy',
  },
  {
    title: 'Date Added',
    dataIndex: 'addedDate',
    key: 'addedDate',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value) => (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(record)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Edit"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(record._id)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Delete"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

