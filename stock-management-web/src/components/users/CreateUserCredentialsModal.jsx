import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../modal/Modal';
import Button from '../Button';
import Input from '../Input';
import InputPassword from '../InputPassword';
import Select from '../Select';

const CreateUserCredentialsModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  allowedRoleOptions
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      number: '',
      role: '',
      password: ''
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleCreate = (data) => {
    onSubmit(data, reset);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create User Credentials" size="md">
      <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
        <Input
          label="Full Name"
          register={register('name', { required: 'Name is required' })}
          error={errors.name}
          placeholder="Enter full name"
        />
        <Input
          label="Email"
          type="email"
          register={register('email', { required: 'Email is required' })}
          error={errors.email}
          placeholder="Enter email"
        />
        <Input
          label="Phone Number"
          register={register('number', { required: 'Phone number is required' })}
          error={errors.number}
          placeholder="Enter phone number"
        />
        <Select
          label="Role"
          register={register('role', { required: 'Role is required' })}
          error={errors.role}
          options={allowedRoleOptions}
          placeholder="Select role"
        />
        <InputPassword
          label="Password"
          register={register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' }
          })}
          error={errors.password}
          placeholder="Set login password"
        />

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserCredentialsModal;

