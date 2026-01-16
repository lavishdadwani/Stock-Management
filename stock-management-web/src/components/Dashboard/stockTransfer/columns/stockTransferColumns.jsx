import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const getStockTransferColumns = (onEdit, onDelete) => [
  {
    title: 'From',
    key: 'fromUser',
    render: (_, record) => {
      ;
      return record.fromUserId ? (
        <span className="font-medium">{record.fromUserId.name}</span>
      ) : '-';
    },
  },
  {
    title: 'To',
    key: 'toUser',
    render: (_, record) => {
      const toUser = record.toUserId;
      return toUser ? (
        <span className="font-medium">{toUser.name}</span>
      ) : '-';
    },
  },
  {
    title: 'Item Name',
    dataIndex: 'itemName',
    key: 'itemName',
  },
  {
    title: 'Quantity',
    key: 'quantity',
    render: (_, record) => (
      <span>
        {record.quantity.toLocaleString()} {record.unit}
      </span>
    ),
  },
  {
    title: 'Transfer Date',
    dataIndex: 'transferDate',
    key: 'transferDate',
    render: (value) => {
      if (!value) return '-';
      return new Date(value).toLocaleString();
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value) => {
      const statusColors = {
        'completed': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'cancelled': 'bg-red-100 text-red-800',
      };
      const displayValue = value === 'completed' ? 'Completed' : 
                          value === 'pending' ? 'Pending' : 'Cancelled';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
          {displayValue}
        </span>
      );
    },
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (value) => value || '-',
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => {
      // Don't show actions if handlers are not provided (for core team members)
      if (!onEdit && !onDelete) {
        return <span className="text-gray-400">-</span>;
      }
      
      return (
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(record)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(record._id)}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Delete"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    },
  },
];

