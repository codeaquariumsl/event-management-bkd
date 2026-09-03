import { InventoryCategoryModel, InventoryItemModel } from '../models/Inventory.js';

// --- CATEGORIES ---

export const getCategories = async (req, res) => {
  try {
    const categories = await InventoryCategoryModel.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory categories', error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const count = await InventoryCategoryModel.countDocuments();
    const id = req.body.id || `cat-${Date.now()}-${count + 1}`;
    const code = req.body.code || req.body.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10);

    const category = new InventoryCategoryModel({
      ...req.body,
      id,
      code,
    });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await InventoryCategoryModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await InventoryCategoryModel.findOneAndDelete({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// --- INVENTORY ITEMS / SERVICE ITEMS ---

export const getItems = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const items = await InventoryItemModel.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory items', error: error.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await InventoryItemModel.findOne({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
};

export const createItem = async (req, res) => {
  try {
    const count = await InventoryItemModel.countDocuments();
    const id = req.body.id || `inv-${Date.now()}-${count + 1}`;
    const sku = req.body.sku || `SKU-${Date.now().toString().slice(-6)}`;

    // Auto calculate status based on availableQuantity
    let status = req.body.status || 'In Stock';
    const available = Number(req.body.availableQuantity ?? req.body.totalStock ?? 1);
    if (available <= 0) {
      status = 'Out of Stock';
    } else if (available <= 2) {
      status = 'Low Stock';
    }

    const item = new InventoryItemModel({
      ...req.body,
      id,
      sku,
      status,
      availableQuantity: available,
    });
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating inventory item', error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.availableQuantity !== undefined) {
      const available = Number(updateData.availableQuantity);
      if (available <= 0) updateData.status = 'Out of Stock';
      else if (available <= 2 && updateData.status !== 'Maintenance') updateData.status = 'Low Stock';
      else if (updateData.status !== 'Maintenance') updateData.status = 'In Stock';
    }

    const item = await InventoryItemModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating inventory item', error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItemModel.findOneAndDelete({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};
