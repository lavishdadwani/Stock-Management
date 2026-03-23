export const getItemProducedColumns = () => [
  { title: 'Item', dataIndex: 'itemName', key: 'itemName' },
  {
    title: 'Source',
    key: 'source',
    render: (_, record) => {
      const isPurchased = record.source === 'purchased';
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPurchased ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
          }`}
        >
          {isPurchased ? 'Purchased' : 'Produced'}
        </span>
      );
    }
  },
  {
    title: 'Customer (purchase)',
    key: 'customerName',
    render: (_, record) =>
      record.source === 'purchased'
        ? record.customerName || record.companyName || '—'
        : '—'
  },
  {
    title: 'Recorded by',
    dataIndex: 'createdByName',
    key: 'createdByName'
  },
  {
    title: 'Quantity',
    key: 'quantity',
    render: (_, record) => `${record.quantity ?? 0} ${record.unit ?? ''}`.trim()
  },
  {
    title: 'Wire Type',
    dataIndex: 'wireUsedType',
    key: 'wireUsedType',
    render: (value, record) =>
      record.source === 'purchased' ? '—' : value ? String(value) : '-'
  },
  {
    title: 'Wire Used Qty (kg)',
    dataIndex: 'wireUsedQuantity',
    key: 'wireUsedQuantity',
    render: (value, record) =>
      record.source === 'purchased'
        ? '—'
        : value === null || value === undefined
          ? '-'
          : value
  },
  {
    title: 'Scrap Qty (kg)',
    dataIndex: 'scrapQuantity',
    key: 'scrapQuantity',
    render: (value, record) =>
      record.source === 'purchased'
        ? '—'
        : value === null || value === undefined
          ? '-'
          : value
  },
  {
    title: 'Date',
    dataIndex: 'productionDate',
    key: 'productionDate',
    render: (value) => (value ? new Date(value).toLocaleString() : '-')
  }
];
