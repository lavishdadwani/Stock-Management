import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../modal/Modal';
import Button from '../Button';
import Input from '../Input';
import InputPassword from '../InputPassword';
import Select from '../Select';

const EditUserModal = ({ isOpen, onClose, onSubmit, loading, user, allowedRoleOptions }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      number: '',
      role: '',
      password: '',
      photo: ''
    }
  });

  useEffect(() => {
    if (user && isOpen) {
      reset({
        name: user.name || '',
        number: user.number || '',
        role: user.role || '',
        password: '',
        photo: user.photo || ''
      });
    }
  }, [user, isOpen, reset]);

  const handleClose = () => {
    onClose();
    if (user) {
      reset({
        name: user.name || '',
        number: user.number || '',
        role: user.role || '',
        password: '',
        photo: user.photo || ''
      });
    }
  };

  const handleSave = (data) => {
    const payload = {
      name: data.name,
      number: data.number,
      role: data.role
    };
    if (data.photo && data.photo.trim()) {
      payload.photo = data.photo.trim();
    } else if (data.photo === '') {
      payload.photo = null;
    }
    if (data.password && data.password.trim()) {
      payload.password = data.password;
    }
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit user" size="md">
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <Input
          label="Full Name"
          register={register('name', { required: 'Name is required' })}
          error={errors.name}
          placeholder="Full name"
        />
        <Input
          label="Phone Number"
          register={register('number', { required: 'Phone number is required' })}
          error={errors.number}
          placeholder="Phone number"
        />
        {allowedRoleOptions?.length > 0 && (
          <Select
            label="Role"
            register={register('role', { required: 'Role is required' })}
            error={errors.role}
            options={allowedRoleOptions}
            placeholder="Select role"
          />
        )}
        <Input
          label="Profile photo URL (optional)"
          register={register('photo')}
          error={errors.photo}
          placeholder="https://..."
        />
        <InputPassword
          label="New password (optional)"
          register={register('password', {
            validate: (value) => {
              if (!value || !String(value).trim()) return true;
              if (String(value).length < 8) return 'At least 8 characters';
              if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                return 'Include uppercase, lowercase, and a number';
              }
              return true;
            }
          })}
          error={errors.password}
          placeholder="Leave blank to keep current password"
        />

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
