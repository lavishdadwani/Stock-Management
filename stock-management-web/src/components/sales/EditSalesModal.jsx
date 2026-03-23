import React from 'react';
import Modal from '../modal/Modal';
import SalesForm from './SalesForm';

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const EditSalesModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  saleData,
  customers,
  availableItems
}) => {
  const initialData = saleData
    ? {
        customerId: saleData.customerId?._id || '',
        itemName: saleData.itemName || '',
        quantity: saleData.quantity ?? '',
        pricePerPiece: saleData.pricePerPiece ?? '',
        saleDate: toDateTimeLocal(saleData.saleDate),
        notes: saleData.notes || ''
      }
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Sale" size="md">
      <SalesForm
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        initialData={initialData}
        customers={customers}
        availableItems={availableItems}
        submitLabel="Update Sale"
      />
    </Modal>
  );
};

export default EditSalesModal;

