import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';
import Select from '../Select';

const SalesForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData = null,
  submitLabel = 'Save Sale',
  customers = [],
  availableItems = []
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {
      customerId: '',
      itemName: '',
      quantity: '',
      pricePerPiece: '',
      saleDate: '',
      notes: ''
    }
  });

  const quantity = useWatch({ control, name: 'quantity' });
  const pricePerPiece = useWatch({ control, name: 'pricePerPiece' });
  const selectedItemName = useWatch({ control, name: 'itemName' });

  const selectedItem = useMemo(
    () => availableItems.find((x) => x.itemName === selectedItemName),
    [availableItems, selectedItemName]
  );

  const computedTotal =
    (Number(quantity) || 0) * (Number(pricePerPiece) || 0);

  const customerOptions = customers.map((c) => ({
    value: c._id,
    label: c.companyName ? `${c.name} (${c.companyName})` : c.name
  }));

  const itemOptions = availableItems.map((item) => ({
    value: item.itemName,
    label: `${item.itemName} (Available: ${item.availableQuantity} pieces)`
  }));

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      quantity: Number(data.quantity),
      pricePerPiece: data.pricePerPiece !== '' ? Number(data.pricePerPiece) : null
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Customer"
        register={register('customerId', { required: 'Customer is required' })}
        error={errors.customerId}
        options={customerOptions}
        placeholder="Select customer"
        required
      />

      <Select
        label="Item"
        register={register('itemName', { required: 'Item is required' })}
        error={errors.itemName}
        options={itemOptions}
        placeholder="Select item"
        required
      />

      {selectedItem && (
        <p className="text-xs text-gray-500">
          Available stock: <span className="font-medium">{selectedItem.availableQuantity} pieces</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity (pieces)"
          type="number"
          register={register('quantity', {
            required: 'Quantity is required',
            min: { value: 1, message: 'Quantity must be greater than 0' },
            validate: (val) => {
              const qty = Number(val) || 0;
              const max = selectedItem?.availableQuantity ?? Infinity;
              return qty <= max || `Quantity cannot exceed available stock (${max})`;
            }
          })}
          error={errors.quantity}
          min="1"
        />
        <Input
          label="Price per Piece (optional)"
          type="number"
          register={register('pricePerPiece', {
            min: { value: 0, message: 'Price must be 0 or greater' }
          })}
          error={errors.pricePerPiece}
          min="0"
          step="0.01"
        />
      </div>

      <Input
        label="Sale Date (optional)"
        type="datetime-local"
        register={register('saleDate')}
        error={errors.saleDate}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Optional notes"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
        Estimated Total: <span className="font-semibold">{computedTotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default SalesForm;

