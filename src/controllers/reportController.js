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
    const pendingCustomerPayments = events.reduce((sum, e) => sum + (e.balance || 0), 0);
    const staffPaymentsDue = staffPayments
      .filter((sp) => sp.status === 'Pending')
      .reduce((sum, sp) => sum + (sp.balance || 0), 0);
    const monthlyRevenue = customerPayments.reduce((sum, cp) => sum + (cp.amount || 0), 0);

    // Status Breakdown
    const statusStats = {
      confirmed: events.filter((e) => e.status === 'Confirmed').length,
      pending: events.filter((e) => e.status === 'Pending').length,
      completed: events.filter((e) => e.status === 'Completed').length,
      inProgress: events.filter((e) => e.status === 'In Progress').length,
      cancelled: events.filter((e) => e.status === 'Cancelled').length,
    };

    // Real Monthly Revenue & Expenses Breakdown (12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyDataMap = {};
    monthNames.forEach((m, idx) => {
      monthlyDataMap[idx] = { month: m, revenue: 0, expenses: 0 };
    });

    // Sum client payments by month
    customerPayments.forEach((p) => {
      if (p.date) {
        const d = new Date(p.date);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          if (monthlyDataMap[m]) monthlyDataMap[m].revenue += (p.amount || 0);
        }
      }
    });

    // If no payments yet for an event month, include event contract amount
    events.forEach((e) => {
      if (e.eventDate) {
        const d = new Date(e.eventDate);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          if (customerPayments.length === 0 && monthlyDataMap[m]) {
            monthlyDataMap[m].revenue += (e.totalAmount || 0);
          }
          const eventExp = (e.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
          const staffCost = (e.assignedStaff || []).reduce((sum, st) => sum + (st.paymentAmount || 0), 0);
          if (monthlyDataMap[m]) {
            monthlyDataMap[m].expenses += (eventExp + staffCost);
          }
        }
      }
    });

    // Add staff payments to expenses
    staffPayments.forEach((sp) => {
      if (sp.date) {
        const d = new Date(sp.date);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          if (monthlyDataMap[m]) monthlyDataMap[m].expenses += (sp.amount || 0);
        }
      }
    });

    const monthlyRevenueChart = monthNames.map((_, idx) => monthlyDataMap[idx]);

    // Service category distribution
    const serviceCategoryCounts = {};
    events.forEach((evt) => {
      (evt.services || []).forEach((srv) => {
        const cat = srv.category || srv.name || 'General Production';
        serviceCategoryCounts[cat] = (serviceCategoryCounts[cat] || 0) + (srv.quantity || 1);
      });
    });

    const serviceDistribution = Object.entries(serviceCategoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => {
        const totalCount = Object.values(serviceCategoryCounts).reduce((s, c) => s + c, 0) || 1;
        return {
          name,
          count,
          percentage: Math.round((count / totalCount) * 100),
        };
      });

    res.json({
      totalEvents,
      upcomingEvents,
      completedEvents,
      activeStaff,
      totalCustomers,
      pendingCustomerPayments,
      staffPaymentsDue,
      monthlyRevenue,
      statusStats,
      monthlyRevenueChart,
      serviceDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error computing dashboard metrics', error });
  }
};
