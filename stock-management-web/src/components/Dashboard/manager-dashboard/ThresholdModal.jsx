import React from 'react';
import Modal from '../../modal/Modal';
import ThresholdForm from './ThresholdForm';

const ThresholdModal = ({ isOpen, onClose, onSubmit, loading, initialData }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Low Stock Alert Thresholds"
      size="md"
    >
      <ThresholdForm
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        initialData={initialData}
      />
    </Modal>
  );
};

export default ThresholdModal;
