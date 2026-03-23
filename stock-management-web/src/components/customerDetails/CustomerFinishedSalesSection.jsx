import React from 'react';
import Button from '../Button';
import Table from '../Table/Table';

const CustomerFinishedSalesSection = ({
  sales,
  columns,
  currentPage,
  total,
  pageSize,
  loading,
  onPageChange,
  onNavigateToAllSales,
  emptyMessage = 'No sales recorded for this customer yet'
}) => {
  return (
    <>
      <Table
        title="Finished products sold"
        columns={columns}
        dataSource={sales}
        currentPage={currentPage}
        total={total}
        pageSize={pageSize}
        onPageChangeHandler={onPageChange}
        loading={loading}
        emptyMessage={emptyMessage}
        rowKey="_id"
      />

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onNavigateToAllSales}>
          Go to all sales
        </Button>
      </div>
    </>
  );
};

export default CustomerFinishedSalesSection;
