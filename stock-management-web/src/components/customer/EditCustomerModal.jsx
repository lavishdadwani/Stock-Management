import React from 'react';
import Modal from '../modal/Modal';
import CustomerForm from './CustomerForm';

const EditCustomerModal = ({ isOpen, onClose, onSubmit, loading, customerData }) => {
  const initialData = customerData
    ? {
        name: customerData.name || '',
        phone: customerData.phone ?? '',
        email: customerData.email || '',
        companyName: customerData.companyName || '',
        gstNumber: customerData.gstNumber || '',
        address: customerData.address || '',
        notes: customerData.notes || '',
        isActive: String(customerData.isActive ?? true)
      }
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Customer" size="md">
      <CustomerForm
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        initialData={initialData}
        submitLabel="Update Customer"
      />
    </Modal>
  );
};

export default EditCustomerModal;

