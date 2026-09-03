import { Request, Response } from 'express';
import { StaffModel } from '../models/Staff.js';
import { EventModel } from '../models/Event.js';
import { StaffPaymentModel } from '../models/Payment.js';

export const getStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staff = await StaffModel.find().sort({ name: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error });
  }
};

export const getStaffById = async (req: Request, res: Response): Promise<void> => {
  try {
    const staffMember = await StaffModel.findOne({ id: req.params.id });
    if (!staffMember) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }
    res.json(staffMember);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff member', error });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await StaffModel.countDocuments();
    const newId = `STF-${String(count + 1).padStart(3, '0')}`;
    const initials = req.body.name
      ? req.body.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
      : 'ST';

    const staff = new StaffModel({
      ...req.body,
      id: newId,
      avatar: initials,
    });

    const saved = await staff.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating staff member', error });
  }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await StaffModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff member', error });
  }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await StaffModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }
    res.json({ success: true, message: 'Staff member deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting staff member', error });
  }
};

export const getPayrollSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const monthYear = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const staffList = await StaffModel.find();
    const events = await EventModel.find({ eventDate: { $regex: `^${monthYear}` } });
    const payments = await StaffPaymentModel.find({
      date: { $regex: `^${monthYear}` },
      status: 'Paid',
    });

    const payroll = staffList.map((member) => {
      const basic = member.employmentType === 'Full Time' ? member.basicSalary : 0;

      // Event payouts for this staff member this month
      const memberEvents = events.filter((e) =>
        e.assignedStaff.some((as) => as.staffId === member.id)
      );

      const eventPayments = memberEvents.reduce((acc, evt) => {
        const as = evt.assignedStaff.find((a) => a.staffId === member.id);
        return acc + (as?.paymentAmount || 0);
      }, 0);

      // Paid to date
      const paid = payments
        .filter((p) => p.staffId === member.id)
        .reduce((sum, p) => sum + p.paidAmount, 0);

      const overtime = member.employmentType === 'Full Time' ? Math.round(basic * 0.08) : 0;
      const bonus = memberEvents.length > 5 ? 15000 : 0;
      const deductions = 0;
      const advance = 0;

      const netPay = basic + eventPayments + overtime + bonus - deductions - advance;
      const balance = Math.max(0, netPay - paid);

      return {
        staffId: member.id,
        staffName: member.name,
        role: member.role,
        employmentType: member.employmentType,
        basicSalary: basic,
        eventPayments,
        overtime,
        bonus,
        deductions,
        advance,
        netPay,
        paidAmount: paid,
        balance,
        status: balance === 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending',
      };
    });

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating payroll', error });
  }
};
