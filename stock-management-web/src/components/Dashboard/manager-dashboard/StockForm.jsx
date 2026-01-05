import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../Button';
import Input from '../../Input';
import Select from '../../Select';

const StockForm = ({ onSubmit, onCancel, loading, initialData = null, submitLabel = 'Add Stock' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {},
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    if (!initialData) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label="Stock Type"
        register={register('stockType', {
          required: 'Stock type is required',
        })}
        error={errors.stockType}
        options={[
          { value: 'Aluminium', label: 'Aluminium' },
          { value: 'Copper', label: 'Copper' },
          { value: 'Scrap', label: 'Scrap' },
        ]}
      />


      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          type="number"
          register={register('quantity', {
            required: 'Quantity is required',
            min: { value: 0, message: 'Quantity must be positive' },
            valueAsNumber: true,
          })}
          error={errors.quantity}
        />

        <Select
          label="Unit"
          register={register('unit', {
            required: 'Unit is required',
          })}
          error={errors.unit}
          options={[
            { value: 'kg', label: 'kg' },
            { value: 'g', label: 'g' },
            { value: 'tons', label: 'tons' },
            { value: 'pieces', label: 'pieces' },
          ]}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default StockForm;

