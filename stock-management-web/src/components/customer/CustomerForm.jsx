import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../Button';
import Input from '../Input';
import Select from '../Select';

const CustomerForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData = null,
  submitLabel = 'Save'
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: initialData || {
      name: '',
      phone: '',
      email: '',
      companyName: '',
      gstNumber: '',
      address: '',
      notes: '',
      isActive: 'true'
    }
  });

  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      phone: data.phone ? Number(data.phone) : null,
      isActive: String(data.isActive) === 'true'
    };
    onSubmit(payload);
    if (!initialData) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Customer Name"
        register={register('name', { required: 'Customer name is required' })}
        error={errors.name}
        placeholder="Enter customer name"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          type="number"
          register={register('phone')}
          error={errors.phone}
          placeholder="Enter phone number"
        />
        <Input
          label="Email"
          type="email"
          register={register('email')}
          error={errors.email}
          placeholder="Enter email"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company Name"
          register={register('companyName')}
          error={errors.companyName}
          placeholder="Enter company name"
        />
        <Input
          label="GST Number"
          register={register('gstNumber')}
          error={errors.gstNumber}
          placeholder="Enter GST number"
        />
      </div>

      <Input
        label="Address"
        register={register('address')}
        error={errors.address}
        placeholder="Enter address"
      />

      <Select
        label="Status"
        register={register('isActive')}
        options={[
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' }
        ]}
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

export default CustomerForm;

