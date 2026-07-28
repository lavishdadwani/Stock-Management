import React from 'react';
import Modal from '../modal/Modal';
import ProducibleItemForm from './ProducibleItemForm';

const AddProducibleItemModal = ({ isOpen, onClose, onSubmit, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Producible Item" size="md">
      <ProducibleItemForm onSubmit={onSubmit} onCancel={onClose} loading={loading} submitLabel="Add Item" />
    </Modal>
  );
};

export default AddProducibleItemModal;
