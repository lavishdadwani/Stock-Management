import React from 'react';
import Table from '../../Table/Table';
import { getStockColumns } from './columns/stockColumns';

const StockTable = ({
  stockData,
  currentPage,
  pageSize,
  onPageChange,
  loading,
  onEdit,
  onDelete,
}) => {
  const columns = getStockColumns(onEdit, onDelete);

  // Paginate data
  const paginatedData = stockData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Table
      columns={columns}
      dataSource={paginatedData}
      currentPage={currentPage}
      total={stockData.length}
      pageSize={pageSize}
      onPageChangeHandler={onPageChange}
      showPagination={true}
      loading={loading}
      rowKey="_id"
      emptyMessage="No stock items found. Click 'Add Stock' to add new items."
    />
  );
};

export default StockTable;

