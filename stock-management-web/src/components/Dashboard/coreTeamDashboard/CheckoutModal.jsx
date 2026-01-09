import React from 'react';
import Modal from '../../modal/Modal';
import CheckoutForm from './CheckoutForm';
import attendanceAPI from '../../../../services/attendance';

const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
  const handleSubmit = async (checkoutData) => {
    const response = await attendanceAPI.checkOut(checkoutData);
    
    if (response.ok) {
      onSuccess();
      onClose();
    }
    
    return response;
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check Out - Fill Production Details"
      size="md"
    >
      <CheckoutForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Modal>
  );
};

export default CheckoutModal;

