import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';
import Select from '../Select';

const ProducibleItemForm = ({ onSubmit, onCancel, loading, initialData = null, submitLabel = 'Add Item' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: initialData || { itemName: '', wireUsedType: '', wireKgPerPiece: '' },
    mode: 'onChange'
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    if (!initialData) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Item Name"
        register={register('itemName', { required: 'Item name is required' })}
        error={errors.itemName}
        required
        placeholder="e.g. 14 P AL"
      />

      <Select
        label="Wire Used Type"
        register={register('wireUsedType', { required: 'Wire type is required' })}
        error={errors.wireUsedType}
        required
        options={[
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'copper', label: 'Copper' }
        ]}
      />

      <Input
        label="Wire (kg) Per Piece"
        type="number"
        step="0.01"
        register={register('wireKgPerPiece', {
          required: 'Wire per piece is required',
          min: { value: 0, message: 'Must be 0 or greater' },
          valueAsNumber: true
        })}
        error={errors.wireKgPerPiece}
        required
        placeholder="e.g. 0.95"
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ProducibleItemForm;
