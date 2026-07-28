import React from 'react';
import Modal from '../modal/Modal';
import ProducibleItemForm from './ProducibleItemForm';

const EditProducibleItemModal = ({ isOpen, onClose, onSubmit, loading, itemData }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Producible Item" size="md">
      <ProducibleItemForm
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        initialData={itemData}
        submitLabel="Save Changes"
      />
    </Modal>
  );
};

export default EditProducibleItemModal;
