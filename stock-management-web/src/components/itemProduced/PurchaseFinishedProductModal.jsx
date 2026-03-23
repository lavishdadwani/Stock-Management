import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../modal/Modal';
import Button from '../Button';
import Input from '../Input';
import Select from '../Select';
import { PRODUCIBLE_ITEMS } from '../../data/producibleItems';

const PurchaseFinishedProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  customers = []
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      customerId: '',
      itemName: '',
      quantity: '',
      productionDate: '',
      pricePerPiece: '',
      description: ''
    }
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        customerId: '',
        itemName: '',
        quantity: '',
        productionDate: '',
        pricePerPiece: '',
        description: ''
      });
    }
  }, [isOpen, reset]);

  const customerOptions = customers.map((c) => ({
    value: String(c._id),
    label: c.companyName ? `${c.name} (${c.companyName})` : c.name
  }));

  const finishedProductOptions = PRODUCIBLE_ITEMS.map((item) => ({
    value: item.itemName || item.value,
    label: item.label || item.itemName || item.value
  }));

  const handleClose = () => {
    onClose();
  };

  const onFormSubmit = (data) => {
    const payload = {
      customerId: data.customerId,
      itemName: String(data.itemName).trim(),
      quantity: Number(data.quantity),
      productionDate: data.productionDate || undefined,
      description: data.description?.trim() || undefined
    };
    if (data.pricePerPiece !== undefined && data.pricePerPiece !== '') {
      const n = Number(data.pricePerPiece);
      if (!Number.isNaN(n)) payload.pricePerPiece = n;
    }
    onSubmit(payload, reset);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Purchase finished product from customer" size="md">
      <p className="text-sm text-gray-600 mb-4">
        Adds pieces to finished stock (same pool as production). Visible in stock with source{' '}
        <strong>Purchased</strong>.
      </p>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Select
          label="Customer"
          register={register('customerId', { required: 'Select a customer' })}
          error={errors.customerId}
          options={customerOptions}
          placeholder="Who did you purchase from?"
        />
        <Select
          label="Finished product"
          register={register('itemName', { required: 'Select a finished product' })}
          error={errors.itemName}
          options={finishedProductOptions}
          placeholder="Select product"
        />
        <Input
          label="Quantity (pieces)"
          type="number"
          register={register('quantity', {
            required: 'Quantity is required',
            min: { value: 1, message: 'Must be at least 1' }
          })}
          error={errors.quantity}
          placeholder="Number of pieces"
        />
        <Input
          label="Purchase date (optional)"
          type="datetime-local"
          register={register('productionDate')}
          error={errors.productionDate}
        />
        <Input
          label="Price per piece (optional)"
          type="number"
          step="0.01"
          register={register('pricePerPiece')}
          error={errors.pricePerPiece}
          placeholder="For your records"
        />
        <Input
          label="Notes (optional)"
          register={register('description')}
          error={errors.description}
          placeholder="Invoice ref., condition, etc."
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Save purchase
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PurchaseFinishedProductModal;
