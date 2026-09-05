import { EventModel } from '../models/Event.js';
import { CustomerModel } from '../models/Customer.js';
import { StaffModel } from '../models/Staff.js';

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const updateCustomerStats = async (customerId) => {
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

export const getEvents = async (req, res) => {
  try {
    const filter = {};
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

export const getEventById = async (req, res) => {
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

// Helper to safely generate the next unique Event ID (EVT-YYYY-XXX)
export const generateNextEventId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `EVT-${currentYear}-`;

  const events = await EventModel.find({}, { id: 1 }).lean();

  let maxSeq = 0;
  for (const ev of events) {
    if (typeof ev?.id === 'string') {
      const match = ev.id.match(/^EVT-(?:\d{4}-)?(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidateId = `${prefix}${String(nextSeq).padStart(3, '0')}`;

  while (await EventModel.exists({ id: candidateId })) {
    nextSeq++;
    candidateId = `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }

  return candidateId;
};

export const createEvent = async (req, res) => {
  try {
    let newId = req.body.id;
    if (!newId || (await EventModel.exists({ id: newId }))) {
      newId = await generateNextEventId();
    }

    const subtotal = req.body.services
      ? req.body.services.reduce((sum, s) => sum + (s.totalPrice || 0), 0)
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

    let saved;
    try {
      saved = await event.save();
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        event.id = await generateNextEventId();
        saved = await event.save();
      } else {
        throw saveErr;
      }
    }

    await updateCustomerStats(saved.customerId);

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const existing = await EventModel.findOne({ id: req.params.id });
    if (!existing) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const subtotal = req.body.services
      ? req.body.services.reduce((sum, s) => sum + (s.totalPrice || 0), 0)
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

export const deleteEvent = async (req, res) => {
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

export const checkStaffConflict = async (req, res) => {
  try {
    const { staffId, date, startTime, endTime, excludeEventId } = req.query;

    if (!staffId || !date || !startTime || !endTime) {
      res.status(400).json({ message: 'staffId, date, startTime, and endTime are required' });
      return;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const filter = {
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
