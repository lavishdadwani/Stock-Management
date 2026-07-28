import React from 'react';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Badge from '../../Badge';
import { getActiveTone } from '../../../utils/badgeTones';

export const getProducibleItemColumns = (onEdit, onDelete, onToggleActive) => [
  {
    title: 'Item Name',
    dataIndex: 'itemName',
    key: 'itemName'
  },
  {
    title: 'Wire Type',
    dataIndex: 'wireUsedType',
    key: 'wireUsedType',
    render: (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '-')
  },
  {
    title: 'Wire (kg) / Piece',
    dataIndex: 'wireKgPerPiece',
    key: 'wireKgPerPiece'
  },
  {
    title: 'Status',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (value) => <Badge tone={getActiveTone(value)}>{value ? 'Active' : 'Inactive'}</Badge>
  },
  {
    title: 'Added By',
    key: 'createdBy',
    render: (_, record) => record.createdBy?.name || '-'
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onToggleActive(record)}
          className="text-gray-600 hover:text-gray-900 transition-colors"
          title={record.isActive ? 'Deactivate' : 'Activate'}
        >
          {record.isActive ? <FaToggleOn className="w-5 h-5 text-green-600" /> : <FaToggleOff className="w-5 h-5" />}
        </button>
        <button
          onClick={() => onEdit(record)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Edit item"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(record._id)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Delete item"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    )
  }
];
