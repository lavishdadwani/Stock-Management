import React from 'react';
import Modal from '../../modal/Modal';
import StockForm from './StockForm';

const EditStockModal = ({ isOpen, onClose, onSubmit, loading, stockData }) => {
  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onClose();
  };

  // Prepare initial data for the form
  const initialData = stockData
    ? {
        itemName: stockData.itemName,
        quantity: stockData.quantity,
        unit: stockData.unit,
        stockType: stockData.stockType || stockData.category, // Support both for backward compatibility
      }
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Stock Item"
      size="md"
    >
      <StockForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
        submitLabel="Update Stock"
      />
    </Modal>
  );
};

export default EditStockModal;

