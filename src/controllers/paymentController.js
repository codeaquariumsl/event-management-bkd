import { CustomerPaymentModel, StaffPaymentModel } from '../models/Payment.js';
import { EventModel } from '../models/Event.js';
import { CustomerModel } from '../models/Customer.js';

export const getCustomerPayments = async (req, res) => {
  try {
    const payments = await CustomerPaymentModel.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer payments', error });
  }
};

export const recordCustomerPayment = async (req, res) => {
  try {
    const count = await CustomerPaymentModel.countDocuments();
    let seq = count + 101;
    let newId = `PAY-CUST-${String(seq)}`;
    while (await CustomerPaymentModel.exists({ id: newId })) {
      seq++;
      newId = `PAY-CUST-${String(seq)}`;
    }

    const payment = new CustomerPaymentModel({
      ...req.body,
      id: newId,
    });

    const savedPayment = await payment.save();

    // Update event paidAmount & balance
    const event = await EventModel.findOne({ id: req.body.eventId });
    if (event) {
      event.paidAmount += Number(req.body.amount);
      event.balance = Math.max(0, event.totalAmount - event.paidAmount);
      event.timeline.push({
        id: `tl-${Date.now()}`,
        title: `Payment Received (LKR ${Number(req.body.amount).toLocaleString()})`,
        description: `Recorded via ${req.body.paymentMethod} (Ref: ${req.body.referenceNumber || 'N/A'})`,
        timestamp: new Date().toLocaleString(),
        completed: true,
        type: 'payment',
      });
      await event.save();

      // Update customer balance
      const customerEvents = await EventModel.find({
        customerId: event.customerId,
        status: { $ne: 'Cancelled' },
      });
      const outstandingBalance = customerEvents.reduce((sum, e) => sum + e.balance, 0);
      await CustomerModel.findOneAndUpdate(
        { id: event.customerId },
        { $set: { outstandingBalance } }
      );
    }

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error recording customer payment', error });
  }
};

export const getStaffPayments = async (req, res) => {
  try {
    const payments = await StaffPaymentModel.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff payments', error });
  }
};

export const recordStaffPayment = async (req, res) => {
  try {
    const count = await StaffPaymentModel.countDocuments();
    let seq = count + 1;
    let newId = `PAY-STF-${String(seq).padStart(3, '0')}`;
    while (await StaffPaymentModel.exists({ id: newId })) {
      seq++;
      newId = `PAY-STF-${String(seq).padStart(3, '0')}`;
    }

    const monthYear = req.body.monthYear || (req.body.date ? req.body.date.slice(0, 7) : new Date().toISOString().slice(0, 7));

    const payment = new StaffPaymentModel({
      ...req.body,
      id: newId,
      monthYear,
      paidAmount: Number(req.body.paidAmount || req.body.amount),
      balance: Math.max(0, Number(req.body.amount) - Number(req.body.paidAmount || req.body.amount)),
    });

    const savedPayment = await payment.save();

    // If linked to event and staff, update assignedStaff
    if (req.body.eventId && req.body.staffId) {
      const event = await EventModel.findOne({ id: req.body.eventId });
      if (event) {
        const asIdx = event.assignedStaff.findIndex((as) => as.staffId === req.body.staffId);
        if (asIdx >= 0) {
          event.assignedStaff[asIdx].paidAmount += Number(req.body.paidAmount || req.body.amount);
          await event.save();
        }
      }
    }

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error recording staff payment', error });
  }
};

export const updateStaffPayment = async (req, res) => {
  try {
    const updated = await StaffPaymentModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Staff payment not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff payment', error });
  }
};

export const deleteStaffPayment = async (req, res) => {
  try {
    const payment = await StaffPaymentModel.findOneAndDelete({ id: req.params.id });
    if (!payment) {
      res.status(404).json({ message: 'Staff payment not found' });
      return;
    }

    // If linked to event and staff, adjust assignedStaff
    if (payment.eventId && payment.staffId) {
      const event = await EventModel.findOne({ id: payment.eventId });
      if (event) {
        const asIdx = event.assignedStaff.findIndex((as) => as.staffId === payment.staffId);
        if (asIdx >= 0) {
          event.assignedStaff[asIdx].paidAmount = Math.max(
            0,
            (event.assignedStaff[asIdx].paidAmount || 0) - (payment.paidAmount || payment.amount || 0)
          );
          await event.save();
        }
      }
    }

    res.json({ success: true, message: 'Staff payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff payment', error });
  }
};

