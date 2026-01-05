import React from 'react';
import Modal from '../../modal/Modal';
import StockForm from './StockForm';

const AddStockModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Stock (Aluminium / Copper / Scrap)"
      size="md"
    >
      <StockForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        submitLabel="Add Stock"
      />
    </Modal>
  );
};

export default AddStockModal;

