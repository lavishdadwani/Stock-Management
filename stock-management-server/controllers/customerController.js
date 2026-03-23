import Customer from '../models/customer.model.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      companyName,
      gstNumber,
      notes,
      isActive
    } = req.body;

    if (!name || !name.trim()) {
      return res.error(
        'Customer name is required',
        null,
        'Please provide customer name',
        400
      );
    }

    const customer = new Customer({
      name: name.trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim().toLowerCase() : null,
      address: address ? String(address).trim() : null,
      companyName: companyName ? String(companyName).trim() : null,
      gstNumber: gstNumber ? String(gstNumber).trim().toUpperCase() : null,
      notes: notes ? String(notes).trim() : null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: req.userId
    });

    const savedCustomer = await customer.save();

    res.success(
      'Customer created successfully',
      savedCustomer,
      'Customer has been added successfully',
      201
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to create customer',
      error,
      'An error occurred while creating customer',
      500
    );
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const { page, limit, search, isActive } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    const query = {};

    if (isActive === 'true' || isActive === 'false') {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } }
      ];
    }


    const customers = await Customer.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = customers.length;
    const paginatedData = formatPaginatedResponse(customers, total, pageNum, limitNum);

    res.success(
      'Customers fetched successfully',
      paginatedData.data,
      null,
      200,
      paginatedData.pagination
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch customers',
      error,
      'An error occurred while fetching customers',
      500
    );
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).populate('createdBy', 'name email role');

    if (!customer) {
      return res.error(
        'Customer not found',
        null,
        'The requested customer does not exist',
        404
      );
    }

    res.success('Customer fetched successfully', customer, null, 200);
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch customer',
      error,
      'An error occurred while fetching customer',
      500
    );
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name !== undefined) {
      if (!String(updateData.name).trim()) {
        return res.error(
          'Customer name is required',
          null,
          'Customer name cannot be empty',
          400
        );
      }
      updateData.name = String(updateData.name).trim();
    }

    if (updateData.phone !== undefined) {
      updateData.phone = updateData.phone ? String(updateData.phone).trim() : null;
    }

    if (updateData.email !== undefined) {
      updateData.email = updateData.email ? String(updateData.email).trim().toLowerCase() : null;
    }

    if (updateData.address !== undefined) {
      updateData.address = updateData.address ? String(updateData.address).trim() : null;
    }

    if (updateData.companyName !== undefined) {
      updateData.companyName = updateData.companyName ? String(updateData.companyName).trim() : null;
    }

    if (updateData.gstNumber !== undefined) {
      updateData.gstNumber = updateData.gstNumber ? String(updateData.gstNumber).trim().toUpperCase() : null;
    }

    if (updateData.notes !== undefined) {
      updateData.notes = updateData.notes ? String(updateData.notes).trim() : null;
    }

    delete updateData.createdBy;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    if (!customer) {
      return res.error(
        'Customer not found',
        null,
        'The requested customer does not exist',
        404
      );
    }

    res.success(
      'Customer updated successfully',
      customer,
      'Customer has been updated successfully',
      200
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to update customer',
      error,
      'An error occurred while updating customer',
      500
    );
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.error(
        'Customer not found',
        null,
        'The requested customer does not exist',
        404
      );
    }

    res.success(
      'Customer deleted successfully',
      customer,
      'Customer has been deleted successfully',
      200
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to delete customer',
      error,
      'An error occurred while deleting customer',
      500
    );
  }
};

