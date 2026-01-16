import React from 'react';
import Modal from '../../modal/Modal';
import TransferStockForm from './TransferStockForm';

const TransferStockModal = ({ isOpen, onClose, onSuccess, loading: externalLoading = false, coreTeamMembers = [], editData = null }) => {


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? "Edit Stock Transfer" : "Transfer Stock to Core Team Member"}
      size="md"
    >
      <TransferStockForm
        editData={editData}
        userOptions={coreTeamMembers}
        onSuccess={onSuccess}
        onClose={onClose}
        loading={externalLoading}
      />
    </Modal>
  );
};

export default TransferStockModal;

