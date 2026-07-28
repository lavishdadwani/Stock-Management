import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../Button';
import Input from '../../Input';

const ThresholdForm = ({ onSubmit, onCancel, loading, initialData = {} }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      aluminium: initialData.aluminium ?? '',
      copper: initialData.copper ?? '',
      scrap: initialData.scrap ?? '',
    },
    mode: 'onChange',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-gray-600">
        Managers/owners get an email alert the first time a material's total stock drops
        to or below its threshold. Leave a field blank to leave that material's threshold unchanged.
      </p>

      <Input
        label="Aluminium threshold (kg)"
        type="number"
        register={register('aluminium', {
          min: { value: 0, message: 'Threshold must be positive' },
        })}
        error={errors.aluminium}
      />

      <Input
        label="Copper threshold (kg)"
        type="number"
        register={register('copper', {
          min: { value: 0, message: 'Threshold must be positive' },
        })}
        error={errors.copper}
      />

      <Input
        label="Scrap threshold (kg)"
        type="number"
        register={register('scrap', {
          min: { value: 0, message: 'Threshold must be positive' },
        })}
        error={errors.scrap}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save thresholds
        </Button>
      </div>
    </form>
  );
};

export default ThresholdForm;
