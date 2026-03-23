import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const getCustomerColumns = (onEdit, onDelete, onViewDetails) => [
  {
    title: 'Name',
    key: 'name',
    render: (_, record) => (
      <div>
        {onViewDetails ? (
          <button
            type="button"
            onClick={() => onViewDetails(record)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            {record.name || '-'}
          </button>
        ) : (
          <p className="font-medium">{record.name || '-'}</p>
        )}
        <p className="text-xs text-gray-500">{record.companyName || '-'}</p>
      </div>
    )
  },
  {
    title: 'Contact',
    key: 'contact',
    render: (_, record) => (
      <div>
        <p>{record.phone || '-'}</p>
        <p className="text-xs text-gray-500">{record.email || '-'}</p>
      </div>
    )
  },
  {
    title: 'GST',
    dataIndex: 'gstNumber',
    key: 'gstNumber',
    render: (value) => value || '-'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    render: (value) => value || '-'
  },
  {
    title: 'Created By',
    key: 'createdBy',
    render: (_, record) => record.createdBy?.name || '-'
  },
  {
    title: 'Status',
    dataIndex: 'isActive',
    key: 'isActive',
    render: (value) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    )
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(record)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Edit customer"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(record._id)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Delete customer"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </div>
    )
  }
];

