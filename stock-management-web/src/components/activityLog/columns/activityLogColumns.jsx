import React from 'react';
import { FaSearch } from 'react-icons/fa';
import Badge from '../../Badge';

const ENTITY_LABELS = {
  stock: 'Stock',
  stockTransfer: 'Stock Transfer',
  sale: 'Sale',
  producibleItem: 'Producible Item'
};

const ACTION_TONES = {
  create: 'success',
  update: 'info',
  delete: 'danger'
};

export const getActivityLogColumns = (onViewDetails) => [
  {
    title: 'When',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (value) => (value ? new Date(value).toLocaleString() : '-')
  },
  {
    title: 'Entity',
    dataIndex: 'entityType',
    key: 'entityType',
    render: (value) => ENTITY_LABELS[value] || value
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (value) => <Badge tone={ACTION_TONES[value]}>{value}</Badge>
  },
  {
    title: 'Performed By',
    key: 'performedBy',
    render: (_, record) => (
      <div>
        <p className="font-medium">{record.performedBy?.name || '-'}</p>
        <p className="text-xs text-gray-500">{record.performedBy?.role || ''}</p>
      </div>
    )
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: 'Details',
    key: 'details',
    render: (_, record) =>
      record.before || record.after ? (
        <button
          onClick={() => onViewDetails(record)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="View before/after"
        >
          <FaSearch className="w-4 h-4" />
        </button>
      ) : (
        '-'
      )
  }
];
