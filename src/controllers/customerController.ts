import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer.js';
import { EventModel } from '../models/Event.js';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await CustomerModel.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await CustomerModel.findOne({ id: req.params.id });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await CustomerModel.countDocuments();
    const newId = `CUST-${String(count + 1).padStart(3, '0')}`;

    const customer = new CustomerModel({
      ...req.body,
      id: newId,
      totalEvents: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
    });

    const saved = await customer.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer', error });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await CustomerModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await CustomerModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error });
  }
};
