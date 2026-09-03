import { UserModel } from '../models/User.js';

export const ROLE_DEFAULT_PERMISSIONS = {
  'Super Admin': [
    'events:view',
    'events:create',
    'events:edit',
    'events:delete',
    'calendar:view',
    'recurring:manage',
    'staff:view',
    'staff:manage',
    'payroll:view',
    'payroll:manage',
    'customers:view',
    'customers:manage',
    'billing:manage',
    'reports:view',
    'users:manage',
    'settings:manage',
  ],
  'Event Director': [
    'events:view',
    'events:create',
    'events:edit',
    'calendar:view',
    'recurring:manage',
    'staff:view',
    'staff:manage',
    'customers:view',
    'customers:manage',
    'billing:manage',
    'reports:view',
  ],
  'Production Manager': [
    'events:view',
    'events:create',
    'events:edit',
    'calendar:view',
    'recurring:manage',
    'staff:view',
    'staff:manage',
    'reports:view',
  ],
  'Finance Officer': [
    'events:view',
    'staff:view',
    'payroll:view',
    'payroll:manage',
    'customers:view',
    'billing:manage',
    'reports:view',
  ],
  'Crew Coordinator': [
    'events:view',
    'calendar:view',
    'staff:view',
    'staff:manage',
  ],
  'Read Only': ['events:view', 'calendar:view'],
};

export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findOne({ id: req.params.id });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

export const createUser = async (req, res) => {
  try {
    let newId = req.body.id;
    if (!newId) {
      const count = await UserModel.countDocuments();
      newId = `USR-${String(count + 1).padStart(3, '0')}`;
      const exists = await UserModel.findOne({ id: newId });
      if (exists) {
        newId = `USR-${Date.now().toString().slice(-4)}`;
      }
    }

    const role = req.body.role || 'Event Director';
    const permissions =
      req.body.permissions && req.body.permissions.length > 0
        ? req.body.permissions
        : ROLE_DEFAULT_PERMISSIONS[role] || [];

    const initials = req.body.name
      ? req.body.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
      : 'U';

    const user = new UserModel({
      ...req.body,
      id: newId,
      avatar: req.body.avatar || initials,
      role,
      permissions,
    });

    const saved = await user.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updated = await UserModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await UserModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

export const getRolesMatrix = async (_req, res) => {
  res.json(ROLE_DEFAULT_PERMISSIONS);
};
