import React from 'react';
import Modal from '../modal/Modal';
import SalesForm from './SalesForm';

const AddSalesModal = ({ isOpen, onClose, onSubmit, loading, customers, availableItems }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Sale" size="md">
      <SalesForm
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        customers={customers}
        availableItems={availableItems}
        submitLabel="Create Sale"
      />
    </Modal>
  );
};

export default AddSalesModal;

