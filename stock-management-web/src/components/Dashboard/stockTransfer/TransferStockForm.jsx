import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from '../../Button';
import Input from '../../Input';
import Select from '../../Select';
import stockTransferAPI from '../../../../services/stockTransfer';

const TransferStockForm = ({ 
  editData = null, 
  userOptions = [], 
  onSuccess, 
  onClose, 
  loading: externalLoading = false 
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      toUserId: editData?.toUserId?._id || editData?.toUserId || '',
      itemName: editData?.itemName || '',
      quantity: editData?.quantity?.toString() || '',
      unit: editData?.unit || 'kg',
      description: editData?.description || ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

useEffect(() => {
  if (editData) {
    reset({
      toUserId: editData.toUserId?._id || editData.toUserId || '',
      itemName: editData.itemName || '',
      quantity: editData.quantity?.toString() || '',
      unit: editData.unit || 'kg',
      description: editData.description || ''
    });
  } else {
    reset({
      toUserId: '',
      itemName: '',
      quantity: '',
      unit: 'kg',
      description: ''
    });
  }
  setSubmitError('');
}, [editData, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitError('');

    try {
      const transferData = {
        toUserId: data.toUserId,
        itemName: data.itemName,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        description: data.description || null
      };

      let response;
      if (editData) {
        // Update existing transfer
        response = await stockTransferAPI.updateStockTransfer(editData._id, transferData);
      } else {
        // Create new transfer
        response = await stockTransferAPI.transferStock(transferData);
      }

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorMessage = response.data?.displayMessage || response.data?.message || (editData ? 'Failed to update stock transfer' : 'Failed to transfer stock');
        setSubmitError(errorMessage);
      }
    } catch (error) {
      setSubmitError(error.message || (editData ? 'An error occurred while updating stock transfer' : 'An error occurred while transferring stock'));
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Recipient (Core Team Member) */}
      <Controller
        name="toUserId"
        control={control}
        rules={{ required: 'Recipient is required' }}
        render={({ field }) => (
          <Select
            label="Transfer To (Core Team Member)"
            name="toUserId"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.toUserId?.message}
            options={userOptions}
            placeholder={userOptions.length === 0 ? "No core team members available" : "Select core team member"}
            required
            disabled={isLoading || userOptions.length === 0}
          />
        )}
      />

      {/* Item Name */}
      <Controller
        name="itemName"
        control={control}
        rules={{ required: 'Item name is required' }}
        render={({ field }) => (
          <Select
            label="Item Name"
            name="itemName"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.itemName?.message}
            options={[
              { value: 'Aluminium', label: 'Aluminium' },
              { value: 'Copper', label: 'Copper' },
              { value: 'Scrap', label: 'Scrap' }
            ]}
            placeholder="Select item"
            required
            disabled={isLoading}
          />
        )}
      />

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="quantity"
          control={control}
          rules={{
            required: 'Quantity is required',
            validate: (value) => {
              const numValue = parseFloat(value);
              if (isNaN(numValue) || numValue <= 0) {
                return 'Quantity must be greater than 0';
              }
              return true;
            }
          }}
          render={({ field }) => (
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.quantity?.message}
              placeholder="Enter quantity"
              required
              disabled={isLoading}
              step="0.01"
              min="0"
            />
          )}
        />

        <Controller
          name="unit"
          control={control}
          rules={{ required: 'Unit is required' }}
          render={({ field }) => (
            <Select
              label="Unit"
              name="unit"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'g', label: 'g' },
                { value: 'ton', label: 'ton' }
              ]}
              required
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Enter any additional notes"
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        )}
      />

      {/* Submit Error */}
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {editData ? 'Update Transfer' : 'Transfer Stock'}
        </Button>
      </div>
    </form>
  );
};

export default TransferStockForm;

