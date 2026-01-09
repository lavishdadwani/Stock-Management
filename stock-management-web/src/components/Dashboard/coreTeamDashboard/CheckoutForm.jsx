import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import Input from '../../Input';
import Select from '../../Select';
import attendanceAPI from '../../../../services/attendance';

const CheckoutForm = ({ onSubmit, onCancel, loading: externalLoading = false }) => {
  const [formData, setFormData] = useState({
    wireUsedType: '',
    wireUsedQuantity: '',
    itemProduced: {
      itemName: '',
      quantity: '',
      unit: 'kg'
    },
    scrapQuantity: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [producibleItems, setProducibleItems] = useState([]);

  useEffect(() => {
    fetchProducibleItems();
  }, []);

  const fetchProducibleItems = async () => {
    try {
      const response = await attendanceAPI.getProducibleItems();
      if (response.ok && response.data?.data) {
        const items = response.data.data.map(item => ({
          value: item.itemName,
          label: item.itemName
        }));
        setProducibleItems(items);
      }
    } catch (error) {
      console.error('Error fetching producible items:', error);
    } finally {
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith('itemProduced.')) {
      const nestedField = field.replace('itemProduced.', '');
      setFormData(prev => ({
        ...prev,
        itemProduced: {
          ...prev.itemProduced,
          [nestedField]: value
        }
      }));
      // Clear error for this field
      if (errors[`itemProduced.${nestedField}`]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`itemProduced.${nestedField}`];
          return newErrors;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.wireUsedType) {
      newErrors.wireUsedType = 'Wire type is required';
    }

    if (!formData.wireUsedQuantity || parseFloat(formData.wireUsedQuantity) <= 0) {
      newErrors.wireUsedQuantity = 'Wire quantity must be greater than 0';
    }

    if (!formData.itemProduced.itemName) {
      newErrors['itemProduced.itemName'] = 'Item name is required';
    }

    if (!formData.itemProduced.quantity || parseFloat(formData.itemProduced.quantity) <= 0) {
      newErrors['itemProduced.quantity'] = 'Item quantity must be greater than 0';
    }

    if (formData.scrapQuantity && parseFloat(formData.scrapQuantity) < 0) {
      newErrors.scrapQuantity = 'Scrap quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const checkoutData = {
        wireUsedType: formData.wireUsedType,
        wireUsedQuantity: parseFloat(formData.wireUsedQuantity),
        itemProduced: {
          itemName: formData.itemProduced.itemName,
          quantity: parseFloat(formData.itemProduced.quantity),
          unit: formData.itemProduced.unit
        },
        scrapQuantity: formData.scrapQuantity ? parseFloat(formData.scrapQuantity) : null,
        description: formData.description || null
      };

      const response = await onSubmit(checkoutData);

      if (response?.ok) {
        // Reset form on success
        setFormData({
          wireUsedType: '',
          wireUsedQuantity: '',
          itemProduced: {
            itemName: '',
            quantity: '',
            unit: 'kg'
          },
          scrapQuantity: '',
          description: ''
        });
        setErrors({});
      } else {
        const errorMessage = response?.data?.displayMessage || response?.data?.message || 'Failed to check out';
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred while checking out' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      wireUsedType: '',
      wireUsedQuantity: '',
      itemProduced: {
        itemName: '',
        quantity: '',
        unit: 'kg'
      },
      scrapQuantity: '',
      description: ''
    });
    setErrors({});
    onCancel();
  };

  const isLoading = loading || externalLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Wire Used Type */}
      <Select
        label="Wire Used Type"
        name="wireUsedType"
        value={formData.wireUsedType}
        onChange={(e) => handleChange('wireUsedType', e.target.value)}
        error={errors.wireUsedType}
        options={[
          { value: 'aluminium', label: 'Aluminium' },
          { value: 'copper', label: 'Copper' }
        ]}
        placeholder="Select wire type"
        required
        disabled={isLoading}
      />

      {/* Wire Used Quantity */}
      <Input
        label="Wire Used Quantity (kg)"
        name="wireUsedQuantity"
        type="number"
        value={formData.wireUsedQuantity}
        onChange={(e) => handleChange('wireUsedQuantity', e.target.value)}
        error={errors.wireUsedQuantity}
        placeholder="Enter quantity in kg"
        required
        disabled={isLoading}
        step="0.01"
        min="0"
      />

      {/* Item Produced Name */}
      <div>
        <Input
          label="Item Produced"
          name="itemProduced.itemName"
          type="text"
          value={formData.itemProduced.itemName}
          onChange={(e) => handleChange('itemProduced.itemName', e.target.value)}
          error={errors['itemProduced.itemName']}
          placeholder="Enter item name"
          required
          disabled={isLoading}
          list="producible-items-list"
        />
        {/* {producibleItems.length > 0 && (
          <datalist id="producible-items-list">
            {producibleItems.map((item) => (
              <option key={item.value} value={item.value} />
            ))}
          </datalist>
        )}
        {producibleItems.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Suggestions: {producibleItems.slice(0, 5).map(item => item.label).join(', ')}
            {producibleItems.length > 5 && `...`}
          </p>
        )} */}
      </div>

      {/* Item Produced Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Item Produced Quantity"
          name="itemProduced.quantity"
          type="number"
          value={formData.itemProduced.quantity}
          onChange={(e) => handleChange('itemProduced.quantity', e.target.value)}
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
          value={formData.itemProduced.unit}
          onChange={(e) => handleChange('itemProduced.unit', e.target.value)}
          options={[
            { value: 'kg', label: 'kg' },
            { value: 'g', label: 'g' },
            { value: 'ton', label: 'ton' }
          ]}
          required
          disabled={isLoading}
        />
      </div>

      {/* Scrap Quantity */}
      <Input
        label="Scrap Quantity (kg) - Optional"
        name="scrapQuantity"
        type="number"
        value={formData.scrapQuantity}
        onChange={(e) => handleChange('scrapQuantity', e.target.value)}
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
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter any additional notes"
          disabled={isLoading}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
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

