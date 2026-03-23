import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../Button';
import Input from '../../Input';
import Select from '../../Select';
import stockTransferAPI from '../../../../services/stockTransfer';
import { PRODUCIBLE_ITEMS } from '../../../data/producibleItems';
import { useForm } from 'react-hook-form';

const CheckoutForm = ({ onSubmit, onCancel, loading: externalLoading = false }) => {
  const [loading, setLoading] = useState(false);

  const producibleItems = useMemo(() => PRODUCIBLE_ITEMS, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      wireUsedType: '',
      wireAvailableQuantity: 0,
      wireUsedQuantity: 0,
      itemProduced: {
        itemName: '',
        quantity: '',
        unit: 'pieces'
      },
      scrapQuantity: '',
      description: ''
    },
    mode: 'onChange'
  });

  const wireUsedType = watch('wireUsedType');
  const wireAvailableQuantity = watch('wireAvailableQuantity');
  const wireUsedQuantity = watch('wireUsedQuantity');
  const itemProducedName = watch('itemProduced.itemName');
  const itemProducedQty = watch('itemProduced.quantity');

  const producibleItemsForWire = useMemo(() => {
    if (!wireUsedType) return [];
    return producibleItems.filter((i) => i.wireUsedType === wireUsedType);
  }, [producibleItems, wireUsedType]);

  const getSelectedProducedItem = (itemName) =>
    producibleItemsForWire.find((i) => i.itemName === itemName || i.value === itemName) || null;

  // When wire type changes, clear item selection if it doesn't belong to that wire type.
  useEffect(() => {
    if (!wireUsedType) {
      setValue('itemProduced.itemName', '', { shouldValidate: true, shouldDirty: true });
      setValue('wireUsedQuantity', 0, { shouldValidate: true, shouldDirty: true });
      return;
    }

    const selected = getSelectedProducedItem(itemProducedName);
    if (!selected && itemProducedName) {
      setValue('itemProduced.itemName', '', { shouldValidate: true, shouldDirty: true });
      setValue('wireUsedQuantity', 0, { shouldValidate: true, shouldDirty: true });
    }
    setValue('itemProduced.unit', 'pieces');
  }, [wireUsedType, itemProducedName, setValue]);

  // When piece quantity changes, recompute wire used quantity based on selected item.
  useEffect(() => {
    const selected = getSelectedProducedItem(itemProducedName);
    if (!selected) {
      if ((Number(wireUsedQuantity) || 0) !== 0) {
        setValue('wireUsedQuantity', 0, { shouldValidate: true, shouldDirty: true });
      }
      return;
    }

    const pieces = Number(itemProducedQty) || 0;
    const nextUsed = Number((pieces * selected.wireKgPerPiece).toFixed(2));
    if ((Number(wireUsedQuantity) || 0) !== nextUsed) {
      setValue('wireUsedQuantity', nextUsed, { shouldValidate: true, shouldDirty: true });
    }
  }, [itemProducedName, itemProducedQty, wireUsedQuantity, producibleItemsForWire, setValue]);

  // Wire used cannot exceed wire available
  useEffect(() => {
    const used = Number(wireUsedQuantity) || 0;
    const available = Number(wireAvailableQuantity) || 0;

    if (used > available) {
      setError('wireUsedQuantity', {
        type: 'validate',
        message: 'Wire used quantity cannot be greater than wire available quantity'
      });
    } else {
      clearErrors('wireUsedQuantity');
    }
  }, [wireUsedQuantity, wireAvailableQuantity, setError, clearErrors]);

  // Fetch wire available quantity whenever wire type changes (core team scope enforced by backend).
  useEffect(() => {
    const wire = wireUsedType;
    if (!wire) {
      setValue('wireAvailableQuantity', 0, { shouldValidate: true, shouldDirty: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await stockTransferAPI.getStockTransferQuantities({ wire });
        if (!cancelled && response?.ok && response.data?.data) {
          const data = response.data.data;
          const available =
            wire === 'aluminium'
              ? data.aluminium?.quantity
              : wire === 'copper'
                ? data.copper?.quantity
                : wire === 'scrap'
                  ? data.scrap?.quantity
                  : 0;
          setValue('wireAvailableQuantity', Number(available) || 0, {
            shouldValidate: true,
            shouldDirty: true
          });
        }
      } catch {
        if (!cancelled) {
          setValue('wireAvailableQuantity', 0, { shouldValidate: true, shouldDirty: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wireUsedType, setValue]);

  const onValidSubmit = async (values) => {
    setLoading(true);
    try {
      const checkoutData = {
        wireUsedType: values.wireUsedType,
        wireUsedQuantity: parseFloat(values.wireUsedQuantity),
        itemProduced: {
          itemName: values.itemProduced.itemName,
          quantity: parseFloat(values.itemProduced.quantity),
          unit: 'pieces'
        },
        scrapQuantity: values.scrapQuantity ? parseFloat(values.scrapQuantity) : null,
        description: values.description || null
      };

      const response = await onSubmit(checkoutData);

      if (response?.ok) {
        reset();
        clearErrors();
      } else {
        const errorMessage =
          response?.data?.displayMessage ||
          response?.data?.message ||
          'Failed to check out';
        setError('root.submit', { type: 'server', message: errorMessage });
      }
    } catch (error) {
      setError('root.submit', {
        type: 'server',
        message: error?.message || 'An error occurred while checking out'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    clearErrors();
    onCancel();
  };

  const isLoading = loading || externalLoading;

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
      {/* Wire Used Type */}
      <Select
        label="Wire Used Type"
        name="wireUsedType"
        register={register('wireUsedType', {
          required: 'Wire type is required'
        })}
        error={errors.wireUsedType}
        options={[
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'copper', label: 'Copper' }
        ]}
        placeholder="Select wire type"
        required
        disabled={isLoading}
      />
      <div className="grid grid-cols-2 gap-4">
      {/* Wire Available Quantity */}
      <Input
        label="Wire Available Quantity (kg)"
        name="wireAvailableQuantity"
        type="number"
        register={register('wireAvailableQuantity')}
        placeholder="0"
        readOnly
        step="0.01"
        min="0"
      />
      {/* Wire Used Quantity */}
      <Input
        label="Wire Used Quantity (kg)"
        name="wireUsedQuantity"
        type="number"
        register={register('wireUsedQuantity', {
          required: 'Wire quantity must be greater than 0',
          validate: (val) => {
            const used = Number(val) || 0;
            const available = Number(watch('wireAvailableQuantity')) || 0;
            if (used <= 0) return 'Wire quantity must be greater than 0';
            return used <= available || 'Wire used quantity cannot be greater than wire available quantity';
          }
        })}
        error={errors.wireUsedQuantity}
        placeholder="0"
        required
        readOnly
        step="0.01"
        min="0"
      />
      </div>

      {/* Item Produced Name */}
      <div>
        <Select
          label="Item Produced"
          name="itemProduced.itemName"
          register={register('itemProduced.itemName', {
            required: 'Item name is required'
          })}
          error={errors['itemProduced.itemName']}
          options={producibleItemsForWire.map((i) => ({ value: i.value, label: i.label }))}
          placeholder="Select item"
          required
          disabled={isLoading || !wireUsedType}
        />
      </div>

      {/* Item Produced Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Item Produced Quantity"
          name="itemProduced.quantity"
          type="number"
          register={register('itemProduced.quantity', {
            required: 'Item quantity must be greater than 0',
            validate: (val) => (Number(val) || 0) > 0 || 'Item quantity must be greater than 0'
          })}
          error={errors['itemProduced.quantity']}
          placeholder="Enter quantity"
          required
          disabled={isLoading}
          step="0.01"
          min="0"
        />

        <Select
          label="Unit"
          name="itemProduced.unit"
          register={register('itemProduced.unit')}
          options={[
            { value: 'pieces', label: 'pieces' }
          ]}
          disabled
        />
      </div>

      {/* Scrap Quantity */}
      <Input
        label="Scrap Quantity (kg) - Optional"
        name="scrapQuantity"
        type="number"
        register={register('scrapQuantity', {
          validate: (val) => {
            if (val === '' || val === null || val === undefined) return true;
            return (Number(val) || 0) >= 0 || 'Scrap quantity cannot be negative';
          }
        })}
        error={errors.scrapQuantity}
        placeholder="Enter scrap quantity in kg"
        disabled={isLoading}
        step="0.01"
        min="0"
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          {...register('description')}
          placeholder="Enter any additional notes"
          disabled={isLoading}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Submit Error */}
      {errors?.root?.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.root.submit.message}</p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
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
          Check Out
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;

