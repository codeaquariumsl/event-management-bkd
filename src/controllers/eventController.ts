import { Request, Response } from 'express';
import { EventModel } from '../models/Event.js';
import { CustomerModel } from '../models/Customer.js';
import { StaffModel } from '../models/Staff.js';

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const updateCustomerStats = async (customerId: string) => {
  try {
    const events = await EventModel.find({ customerId, status: { $ne: 'Cancelled' } });
    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, e) => sum + e.totalAmount, 0);
    const outstandingBalance = events.reduce((sum, e) => sum + e.balance, 0);

    await CustomerModel.findOneAndUpdate(
      { id: customerId },
      { $set: { totalEvents, totalRevenue, outstandingBalance } }
    );
  } catch (err) {
    console.error('Error updating customer stats:', err);
  }
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = req.query.status;
    }
    if (req.query.eventType && req.query.eventType !== 'ALL') {
      filter.eventType = req.query.eventType;
    }
    if (req.query.customerId) {
      filter.customerId = req.query.customerId;
    }

    const events = await EventModel.find(filter).sort({ eventDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await EventModel.findOne({ id: req.params.id });
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await EventModel.countDocuments();
    const newId = req.body.id || `EVT-2026-${String(count + 1).padStart(3, '0')}`;

    const subtotal = req.body.services
      ? req.body.services.reduce((sum: number, s: any) => sum + (s.totalPrice || 0), 0)
      : req.body.subtotal || 0;

    const discount = Number(req.body.discount || 0);
    const additionalCharges = Number(req.body.additionalCharges || 0);
    const totalAmount = Math.max(0, subtotal - discount + additionalCharges);
    const paidAmount = Number(req.body.paidAmount || 0);
    const balance = Math.max(0, totalAmount - paidAmount);

    const now = new Date().toISOString();

    const event = new EventModel({
      ...req.body,
      id: newId,
      subtotal,
      totalAmount,
      balance,
      paidAmount,
      timeline: req.body.timeline || [
        {
          id: `tl-${Date.now()}`,
          title: 'Event Created',
          description: 'Booking recorded in system',
          timestamp: new Date().toLocaleString(),
          completed: true,
          type: 'created',
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    const saved = await event.save();
    await updateCustomerStats(saved.customerId);

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await EventModel.findOne({ id: req.params.id });
    if (!existing) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const subtotal = req.body.services
      ? req.body.services.reduce((sum: number, s: any) => sum + (s.totalPrice || 0), 0)
      : req.body.subtotal ?? existing.subtotal;

    const discount = req.body.discount !== undefined ? Number(req.body.discount) : existing.discount;
    const additionalCharges = req.body.additionalCharges !== undefined ? Number(req.body.additionalCharges) : existing.additionalCharges;
    const totalAmount = Math.max(0, subtotal - discount + additionalCharges);
    const paidAmount = req.body.paidAmount !== undefined ? Number(req.body.paidAmount) : existing.paidAmount;
    const balance = Math.max(0, totalAmount - paidAmount);

    const updated = await EventModel.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          ...req.body,
          subtotal,
          totalAmount,
          balance,
          paidAmount,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true }
    );

    if (updated) {
      await updateCustomerStats(updated.customerId);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await EventModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    await updateCustomerStats(deleted.customerId);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
};

export const checkStaffConflict = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId, date, startTime, endTime, excludeEventId } = req.query as {
      staffId: string;
      date: string;
      startTime: string;
      endTime: string;
      excludeEventId?: string;
    };

    if (!staffId || !date || !startTime || !endTime) {
      res.status(400).json({ message: 'staffId, date, startTime, and endTime are required' });
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const filter: any = {
      eventDate: date,
      status: { $ne: 'Cancelled' },
      'assignedStaff.staffId': staffId,
    };

    if (excludeEventId) {
      filter.id = { $ne: excludeEventId };
    }

    const events = await EventModel.find(filter);
    const staff = await StaffModel.findOne({ id: staffId });
    const staffName = staff?.name || 'Staff Member';

    for (const evt of events) {
      const evtStart = timeToMinutes(evt.startTime);
      const evtEnd = timeToMinutes(evt.endTime);

      if (startMinutes < evtEnd && endMinutes > evtStart) {
        res.json({
          hasConflict: true,
          conflictingEvent: evt,
          staffName,
        });
        return;
      }
    }

    res.json({ hasConflict: false });
  } catch (error) {
    res.status(500).json({ message: 'Error checking schedule conflict', error });
  }
};
