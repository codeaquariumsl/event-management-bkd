import { EventModel } from '../models/Event.js';
import { StaffModel } from '../models/Staff.js';
import { CustomerModel } from '../models/Customer.js';
import { CustomerPaymentModel, StaffPaymentModel } from '../models/Payment.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    const events = await EventModel.find();
    const staff = await StaffModel.find();
    const customers = await CustomerModel.find();
    const customerPayments = await CustomerPaymentModel.find();
    const staffPayments = await StaffPaymentModel.find();

    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => e.status === 'Confirmed' || e.status === 'Pending' || e.status === 'In Progress'
    ).length;
    const completedEvents = events.filter((e) => e.status === 'Completed').length;
    const activeStaff = staff.filter((s) => s.status === 'Active').length;
    const totalCustomers = customers.length;
    const pendingCustomerPayments = events.reduce((sum, e) => sum + e.balance, 0);
    const staffPaymentsDue = staffPayments
      .filter((sp) => sp.status === 'Pending')
      .reduce((sum, sp) => sum + sp.balance, 0);
    const monthlyRevenue = customerPayments.reduce((sum, cp) => sum + cp.amount, 0);

    res.json({
      totalEvents,
      upcomingEvents,
      completedEvents,
      activeStaff,
      totalCustomers,
      pendingCustomerPayments,
      staffPaymentsDue,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error computing dashboard metrics', error });
  }
};
