import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { RoleModel } from '../models/Role.js';

export const ROLE_DEFAULT_PERMISSIONS = {
  'Super Admin': ['*'],
  'Event Director': [
    'dashboard.view',
    'events.view',
    'events.create',
    'events.edit',
    'calendar.view',
    'quotations.view',
    'quotations.create',
    'quotations.edit',
    'recurring.view',
    'recurring.create',
    'recurring.edit',
    'recurring.manage',
    'customers.view',
    'customers.create',
    'customers.edit',
    'customer_payments.view',
    'customer_payments.create',
    'event_types.view',
    'event_types.create',
    'event_types.edit',
    'services.view',
    'services.create',
    'services.edit',
    'inventory.view',
    'staff.view',
    'staff.create',
    'staff.edit',
    'staff_payments.view',
    'reports.view',
    'reports.export',
    'settings.view',
  ],
  'Production Manager': [
    'dashboard.view',
    'events.view',
    'events.create',
    'events.edit',
    'calendar.view',
    'quotations.view',
    'recurring.view',
    'event_types.view',
    'services.view',
    'inventory.view',
    'inventory.create',
    'inventory.edit',
    'staff.view',
    'staff.create',
    'staff.edit',
    'reports.view',
  ],
  'Finance Officer': [
    'dashboard.view',
    'events.view',
    'quotations.view',
    'customers.view',
    'customers.create',
    'customer_payments.view',
    'customer_payments.create',
    'customer_payments.delete',
    'staff.view',
    'staff_payments.view',
    'staff_payments.create',
    'staff_payments.delete',
    'reports.view',
    'reports.export',
    'settings.view',
  ],
  'Crew Coordinator': [
    'dashboard.view',
    'events.view',
    'calendar.view',
    'recurring.view',
    'staff.view',
    'staff.create',
    'staff.edit',
  ],
  'Read Only': [
    'dashboard.view',
    'events.view',
    'calendar.view',
    'quotations.view',
    'recurring.view',
    'customers.view',
    'customer_payments.view',
    'event_types.view',
    'services.view',
    'inventory.view',
    'staff.view',
    'staff_payments.view',
    'reports.view',
    'settings.view',
  ],
};

export const ROLE_DESCRIPTIONS = {
  'Super Admin': 'Full unrestricted rights across all 15 operational modules, accounting, and system provisioning.',
  'Event Director': 'Authoring, client agreements, crew allocation, quotation approval, customer invoicing, and calendar coordination.',
  'Production Manager': 'AV inventory management, equipment maintenance tracking, stage crew rostering, and event technical run sheets.',
  'Finance Officer': 'Managing client invoice collections, issuing tax receipts, reconciling staff gig payouts, and monthly payroll.',
  'Crew Coordinator': 'Crew schedule monitoring, event rosters, artist check-ins, and production calendar coordination.',
  'Read Only': 'View-only rights to event overviews, calendars, and customer directories without editing or financial disbursement rights.',
};

import mongoose from 'mongoose';

/**
 * Ensures standard roles exist in MongoDB
 */
export const ensureRolesSeeded = async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    for (const [roleName, permissions] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
      const existing = await RoleModel.findOne({ name: roleName });
      if (!existing) {
        await RoleModel.create({
          name: roleName,
          description: ROLE_DESCRIPTIONS[roleName] || '',
          isSystem: true,
          permissions,
        });
      }
    }
  } catch (err) {
    console.warn('Error auto-seeding roles:', err);
  }
};

// Seed on startup
ensureRolesSeeded();

// ==================== ROLES MANAGEMENT API ====================

export const getRoles = async (req, res) => {
  try {
    await ensureRolesSeeded();
    const roles = await RoleModel.find().sort({ isSystem: -1, createdAt: 1 });
    const users = await UserModel.find();

    const result = roles.map((r) => {
      const usersCount = users.filter((u) => u.role === r.name).length;
      return {
        id: r._id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissions: r.permissions,
        usersCount,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error });
  }
};

export const getRoleByName = async (req, res) => {
  try {
    const role = await RoleModel.findOne({ name: req.params.name });
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Role name is required' });
      return;
    }

    const trimmedName = name.trim();
    const exists = await RoleModel.findOne({ name: trimmedName });
    if (exists) {
      res.status(400).json({ message: `Role "${trimmedName}" already exists` });
      return;
    }

    const newRole = new RoleModel({
      name: trimmedName,
      description: description || '',
      isSystem: false,
      permissions: Array.isArray(permissions) ? permissions : [],
    });

    const saved = await newRole.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error });
  }
};

export const updateRole = async (req, res) => {
  try {
    const roleName = req.params.name;
    const { permissions, description } = req.body;

    const role = await RoleModel.findOne({ name: roleName });
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    if (permissions !== undefined) {
      role.permissions = permissions;
    }
    if (description !== undefined) {
      role.description = description;
    }

    const saved = await role.save();

    // Also update cached permissions on any existing users for consistency
    await UserModel.updateMany({ role: roleName }, { $set: { permissions: role.permissions } });

    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role permissions', error });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const roleName = req.params.name;
    const role = await RoleModel.findOne({ name: roleName });
    if (!role) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }

    if (role.isSystem) {
      res.status(400).json({ message: 'Standard system roles cannot be deleted' });
      return;
    }

    // Check if any users are currently assigned to this role
    const usersWithRole = await UserModel.countDocuments({ role: roleName });
    if (usersWithRole > 0) {
      res.status(400).json({
        message: `Cannot delete role "${roleName}" because ${usersWithRole} operator(s) are assigned to it. Please reassign those users first.`,
      });
      return;
    }

    await RoleModel.findOneAndDelete({ name: roleName });
    res.json({ success: true, message: `Role "${roleName}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting role', error });
  }
};

export const getRolesMatrix = async (_req, res) => {
  try {
    await ensureRolesSeeded();
    const roles = await RoleModel.find();
    const matrix = {};
    for (const r of roles) {
      matrix[r.name] = r.permissions;
    }
    res.json(matrix);
  } catch (error) {
    res.json(ROLE_DEFAULT_PERMISSIONS);
  }
};

// ==================== USERS API ====================

export const getUsers = async (req, res) => {
  try {
    const roles = await RoleModel.find();
    const roleMap = new Map(roles.map((r) => [r.name, r.permissions]));

    const users = await UserModel.find().sort({ createdAt: -1 });

    // Derive permissions dynamically from role
    const mapped = users.map((u) => {
      const doc = u.toJSON();
      const rolePerms = roleMap.get(u.role) || ROLE_DEFAULT_PERMISSIONS[u.role] || [];
      doc.permissions = rolePerms;
      return doc;
    });

    res.json(mapped);
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

    const doc = user.toJSON();
    const roleDoc = await RoleModel.findOne({ name: user.role });
    doc.permissions = roleDoc ? roleDoc.permissions : ROLE_DEFAULT_PERMISSIONS[user.role] || [];

    res.json(doc);
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
    const roleDoc = await RoleModel.findOne({ name: role });
    const permissions = roleDoc ? roleDoc.permissions : ROLE_DEFAULT_PERMISSIONS[role] || [];

    const initials = req.body.name
      ? req.body.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
      : 'U';

    let hashedPassword = req.body.password;
    if (hashedPassword && !hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(hashedPassword, salt);
    }

    const user = new UserModel({
      ...req.body,
      id: newId,
      avatar: req.body.avatar || initials,
      role,
      permissions,
      ...(hashedPassword ? { password: hashedPassword } : {}),
    });

    const saved = await user.save();
    const json = saved.toJSON();
    json.permissions = permissions;

    res.status(201).json(json);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({ id: req.params.id });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const updates = { ...req.body };
    if (!updates.password) {
      delete updates.password;
    } else if (!updates.password.startsWith('$2a$') && !updates.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const targetRole = updates.role || user.role;
    const roleDoc = await RoleModel.findOne({ name: targetRole });
    updates.permissions = roleDoc ? roleDoc.permissions : ROLE_DEFAULT_PERMISSIONS[targetRole] || [];

    Object.assign(user, updates);
    const updated = await user.save();
    const json = updated.toJSON();
    json.permissions = updates.permissions;

    res.json(json);
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

export const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }
    const user = await UserModel.findOne({ id: req.params.id });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password', error });
  }
};
