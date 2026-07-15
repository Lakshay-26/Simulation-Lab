const db = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const users = await db.User.find({});
    const sanitized = users.map(u => ({
      id: u.id || u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      phone: u.phone,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      isVerified: u.isVerified,
      createdAt: u.createdAt
    }));
    return res.status(200).json({ users: sanitized });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['student', 'analyst', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid or missing role' });
    }

    const targetUser = await db.User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.User.findByIdAndUpdate(req.params.id, { role });

    await db.History.create({
      userId: req.user.id,
      type: 'profile',
      action: `Updated role of ${targetUser.username} to ${role}`,
      module: 'Admin Control',
      severity: 'medium',
      details: { targetUserId: targetUser.id || targetUser._id, newRole: role }
    });

    return res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const targetUser = await db.User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.User.findByIdAndDelete(req.params.id);
    await db.History.deleteMany({ userId: req.params.id });
    await db.Report.deleteMany({ userId: req.params.id });

    await db.History.create({
      userId: req.user.id,
      type: 'profile',
      action: `Deleted user account: ${targetUser.username}`,
      module: 'Admin Control',
      severity: 'high',
      details: { deletedUsername: targetUser.username }
    });

    return res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const logs = await db.SystemLog.find({});
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ logs });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getSystemAnalytics = async (req, res) => {
  try {
    const totalUsers = await db.User.countDocuments({});
    const totalReports = await db.Report.countDocuments({ isDeleted: { $ne: true } });
    const totalScans = await db.History.countDocuments({ type: 'scan', isDeleted: { $ne: true } });
    const totalSimulations = await db.History.countDocuments({ type: 'simulation', isDeleted: { $ne: true } });
    const totalDefenses = await db.History.countDocuments({ type: 'defense', isDeleted: { $ne: true } });

    const recentRegistrations = await db.User.find({});
    recentRegistrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      analytics: {
        totalUsers,
        totalReports,
        totalScans,
        totalSimulations,
        totalDefenses
      },
      recentUsers: recentRegistrations.slice(0, 5).map(u => ({
        username: u.username,
        email: u.email,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getSystemLogs,
  getSystemAnalytics
};
