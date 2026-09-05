import { QuotationModel } from '../models/Quotation.js';
import { EventModel } from '../models/Event.js';

export const getQuotations = async (req, res) => {
  try {
    const { status, customerId } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (customerId) filter.customerId = customerId;

    const quotations = await QuotationModel.find(filter).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quotations', error: error.message });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const quotation = await QuotationModel.findOne({ id: req.params.id });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quotation', error: error.message });
  }
};

export const createQuotation = async (req, res) => {
  try {
    const count = await QuotationModel.countDocuments();
    const id = req.body.id || `quot-${Date.now()}-${count + 1}`;
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${yy}${mm}-`;

    let quotationNumber = req.body.quotationNumber;
    if (!quotationNumber) {
      const monthQuotes = await QuotationModel.find({
        quotationNumber: new RegExp(`^${prefix}`),
      }).select('quotationNumber');

      let nextSeq = 1;
      if (monthQuotes && monthQuotes.length > 0) {
        const maxSeq = monthQuotes.reduce((max, q) => {
          const num = parseInt(q.quotationNumber.slice(prefix.length), 10);
          return !isNaN(num) && num > max ? num : max;
        }, 0);
        nextSeq = maxSeq + 1;
      }
      quotationNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    }

    const quotation = new QuotationModel({
      ...req.body,
      id,
      quotationNumber,
    });
    const saved = await quotation.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quotation', error: error.message });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    const quotation = await QuotationModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quotation', error: error.message });
  }
};

export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await QuotationModel.findOneAndDelete({ id: req.params.id });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({ message: 'Quotation deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quotation', error: error.message });
  }
};

export const convertToEvent = async (req, res) => {
  try {
    const quotation = await QuotationModel.findOne({ id: req.params.id });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Map quotation items to event services
    const services = quotation.items.map((item, idx) => ({
      id: item.id || `srv-conv-${idx + 1}`,
      name: item.name,
      category: item.category || 'Production',
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
    }));

    const eventCount = await EventModel.countDocuments();
    const eventId = `EVT-${Date.now()}-${eventCount + 1}`;

    const newEvent = new EventModel({
      id: eventId,
      name: quotation.title || `Event for ${quotation.customerName}`,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      customerCompany: quotation.customerCompany,
      customerPhone: quotation.customerPhone,
      customerEmail: quotation.customerEmail,
      eventType: quotation.eventType || 'Other',
      eventDate: quotation.eventDate,
      startTime: '18:00',
      endTime: '23:30',
      location: quotation.venue || 'TBD',
      address: quotation.venue || '',
      status: 'Confirmed',
      services,
      assignedStaff: [],
      expenses: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'Quotation Accepted & Converted to Event',
          description: `Converted from Quotation ${quotation.quotationNumber}`,
          timestamp: new Date().toLocaleString(),
          completed: true,
          type: 'created',
        },
      ],
      discount: quotation.discount || 0,
      additionalCharges: quotation.additionalCharges || 0,
      totalAmount: quotation.totalAmount || 0,
      paidAmount: 0,
      balance: quotation.totalAmount || 0,
      notes: quotation.notes || '',
    });

    const savedEvent = await newEvent.save();

    // Update quotation status to Accepted and record convertedEventId
    quotation.status = 'Accepted';
    quotation.convertedEventId = eventId;
    await quotation.save();

    res.json({
      message: 'Quotation successfully converted to Event',
      event: savedEvent,
      quotation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error converting quotation to event', error: error.message });
  }
};
