import React from 'react';
import Modal from '../modal/Modal';
import CustomerForm from './CustomerForm';

const AddCustomerModal = ({ isOpen, onClose, onSubmit, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Customer" size="md">
      <CustomerForm
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        submitLabel="Add Customer"
      />
    </Modal>
  );
};

export default AddCustomerModal;

