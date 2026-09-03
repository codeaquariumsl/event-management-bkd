import { RecurringEventModel } from '../models/RecurringEvent.js';
import { EventModel } from '../models/Event.js';
import { StaffModel } from '../models/Staff.js';

export const getRecurringEvents = async (req, res) => {
  try {
    const list = await RecurringEventModel.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recurring events', error });
  }
};

export const createRecurringEvent = async (req, res) => {
  try {
    const count = await RecurringEventModel.countDocuments();
    const newId = `REC-${String(count + 1).padStart(3, '0')}`;

    const recurring = new RecurringEventModel({
      ...req.body,
      id: newId,
      generatedCount: 0,
    });

    const saved = await recurring.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recurring series', error });
  }
};

export const generateEvents = async (req, res) => {
  try {
    const seriesId = req.params.id;
    const countToGenerate = Number(req.body.count || 4);

    const recurring = await RecurringEventModel.findOne({ id: seriesId });
    if (!recurring) {
      res.status(404).json({ message: 'Recurring event series not found' });
      return;
    }

    const staffList = await StaffModel.find();
    const assignedStaff = recurring.assignedStaffIds.map((sid) => {
      const s = staffList.find((st) => st.id === sid);
      return {
        id: `as-${Date.now()}-${sid}`,
        staffId: sid,
        staffName: s?.name || 'Staff',
        role: s?.role || 'DJ',
        assignedDate: recurring.startDate,
        startTime: recurring.startTime,
        endTime: recurring.endTime,
        paymentAmount: s?.defaultRatePerEvent || 20000,
        paidAmount: 0,
        status: 'Confirmed',
      };
    });

    const baseDate = new Date(recurring.startDate);
    const dayInterval =
      recurring.frequency === 'Daily'
        ? 1
        : recurring.frequency === 'Biweekly'
        ? 14
        : recurring.frequency === 'Monthly'
        ? 30
        : 7;

    const createdEvents = [];
    const eventCount = await EventModel.countDocuments();

    for (let i = 1; i <= countToGenerate; i++) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(targetDate.getDate() + i * dayInterval);
      const dateStr = targetDate.toISOString().split('T')[0];
      const newEvtId = `EVT-2026-${String(eventCount + i).padStart(3, '0')}`;

      const newEvt = new EventModel({
        id: newEvtId,
        name: `${recurring.seriesName} (Session #${recurring.generatedCount + i})`,
        customerId: recurring.customerId,
        customerName: recurring.customerName,
        eventType: recurring.eventType,
        eventDate: dateStr,
        startTime: recurring.startTime,
        endTime: recurring.endTime,
        location: recurring.location,
        description: `Generated from recurring series: ${recurring.seriesName}`,
        status: 'Confirmed',
        services: recurring.services,
        assignedStaff: assignedStaff.map((as) => ({ ...as, assignedDate: dateStr })),
        expenses: [],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            title: 'Generated from Recurring Series',
            description: `Auto-created from ${recurring.seriesName}`,
            timestamp: new Date().toLocaleString(),
            completed: true,
            type: 'created',
          },
        ],
        subtotal: recurring.defaultPrice,
        discount: 0,
        additionalCharges: 0,
        totalAmount: recurring.defaultPrice,
        paidAmount: 0,
        balance: recurring.defaultPrice,
        recurringSeriesId: recurring.id,
      });

      const savedEvt = await newEvt.save();
      createdEvents.push(savedEvt);
    }

    recurring.generatedCount += countToGenerate;
    recurring.lastGeneratedDate = new Date().toISOString().split('T')[0];
    await recurring.save();

    res.status(201).json(createdEvents);
  } catch (error) {
    res.status(500).json({ message: 'Error generating events', error });
  }
};
