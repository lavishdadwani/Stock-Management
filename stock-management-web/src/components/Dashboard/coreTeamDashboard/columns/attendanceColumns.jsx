import React from 'react';

export const getAttendanceColumns = () => [
  {
    title: 'Check In Time',
    dataIndex: 'checkInTime',
    key: 'checkInTime',
    render: (value) => {
      if (!value) return '-';
      return new Date(value).toLocaleString();
    },
  },
  {
    title: 'Check Out Time',
    dataIndex: 'checkOutTime',
    key: 'checkOutTime',
    render: (value) => {
      if (!value) return '-';
      return new Date(value).toLocaleString();
    },
  },
  {
    title: 'Duration',
    key: 'duration',
    render: (_, record) => {
      if (!record.checkInTime || !record.checkOutTime) return '-';
      const duration = new Date(record.checkOutTime) - new Date(record.checkInTime);
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (value) => {
      const statusColors = {
        'checked-in': 'bg-blue-100 text-blue-800',
        'checked-out': 'bg-green-100 text-green-800',
      };
      const displayValue = value === 'checked-in' ? 'Checked In' : 'Checked Out';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
          {displayValue}
        </span>
      );
    },
  },
  {
    title: 'Wire Used',
    key: 'wireUsed',
    render: (_, record) => {
      if (!record.itemId) return '-';
      const wireType = record.itemId.wireUsedType || '-';
      const quantity = record.itemId.wireUsedQuantity || 0;
      return (
        <span>
          {wireType !== '-' ? `${wireType.charAt(0).toUpperCase() + wireType.slice(1)}: ${quantity} kg` : '-'}
        </span>
      );
    },
  },
  {
    title: 'Item Produced',
    key: 'itemProduced',
    render: (_, record) => {
      if (!record.itemId) return '-';
      const itemName = record.itemId.itemName || '-';
      const quantity = record.itemId.quantity || 0;
      const unit = record.itemId.unit || 'kg';
      return (
        <span>
          {itemName !== '-' ? `${itemName}: ${quantity} ${unit}` : '-'}
        </span>
      );
    },
  },
  {
    title: 'Scrap Generated',
    key: 'scrap',
    render: (_, record) => {
      if (!record.itemId || !record.itemId.scrapQuantity) return '-';
      return <span>{record.itemId.scrapQuantity} kg</span>;
    },
  },
];

