import { EventTypeModel } from '../models/EventType.js';

export const getEventTypes = async (req, res) => {
  try {
    const eventTypes = await EventTypeModel.find().sort({ sortOrder: 1, name: 1 });
    res.json(eventTypes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event types', error: error.message });
  }
};

export const getEventTypeById = async (req, res) => {
  try {
    const eventType = await EventTypeModel.findOne({ id: req.params.id });
    if (!eventType) {
      return res.status(404).json({ message: 'Event type not found' });
    }
    res.json(eventType);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event type', error: error.message });
  }
};

export const createEventType = async (req, res) => {
  try {
    const count = await EventTypeModel.countDocuments();
    const id = req.body.id || `et-${Date.now()}-${count + 1}`;
    const code = req.body.code || req.body.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10);

    const eventType = new EventTypeModel({
      ...req.body,
      id,
      code,
    });
    const saved = await eventType.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event type', error: error.message });
  }
};

export const updateEventType = async (req, res) => {
  try {
    const eventType = await EventTypeModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!eventType) {
      return res.status(404).json({ message: 'Event type not found' });
    }
    res.json(eventType);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event type', error: error.message });
  }
};

export const deleteEventType = async (req, res) => {
  try {
    const eventType = await EventTypeModel.findOneAndDelete({ id: req.params.id });
    if (!eventType) {
      return res.status(404).json({ message: 'Event type not found' });
    }
    res.json({ message: 'Event type deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event type', error: error.message });
  }
};
