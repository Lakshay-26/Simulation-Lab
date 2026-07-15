const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cyber_security_simulation_key';

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingEmail = await db.User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUsername = await db.User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await db.User.create({
      username,
      email,
      password: hashedPassword,
      role: 'student',
      isVerified: false,
      verificationToken
    });

    await db.History.create({
      userId: newUser.id,
      type: 'profile',
      action: 'Account registered',
      module: 'Auth',
      severity: 'info',
      details: { username: newUser.username, email: newUser.email }
    });

    return res.status(201).json({
      message: 'Registration successful. Verification code sent to your email (simulated).',
      userId: newUser.id,
      verificationToken
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await db.User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn });

    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    await db.History.create({
      userId: user.id,
      type: 'login',
      action: 'User logged in',
      module: 'Auth',
      severity: 'info',
      details: { ip: req.ip, rememberMe: !!rememberMe }
    });

    await db.SystemLog.create({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      route: '/auth/login',
      method: 'POST'
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: 'User ID and code are required' });
    }

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.verificationToken !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    await db.User.findByIdAndUpdate(userId, {
      isVerified: true,
      verificationToken: ''
    });

    await db.History.create({
      userId: user.id,
      type: 'profile',
      action: 'Email address verified',
      module: 'Auth',
      severity: 'info'
    });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await db.User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000).toISOString();

    await db.User.findByIdAndUpdate(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires
    });

    await db.History.create({
      userId: user.id,
      type: 'profile',
      action: 'Password reset requested',
      module: 'Auth',
      severity: 'info'
    });

    return res.status(200).json({
      message: 'Password reset link generated (simulated).',
      resetToken
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const user = await db.User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const expiryTime = new Date(user.resetPasswordExpires).getTime();
    if (expiryTime < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.User.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      resetPasswordToken: '',
      resetPasswordExpires: null
    });

    await db.History.create({
      userId: user.id,
      type: 'profile',
      action: 'Password reset successfully',
      module: 'Auth',
      severity: 'warning'
    });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await db.User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword
    });

    await db.History.create({
      userId: req.user.id,
      type: 'profile',
      action: 'Password changed from settings',
      module: 'Auth',
      severity: 'warning'
    });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, phone, bio } = req.body;
    const updateData = {};

    if (username !== undefined) {
      const existing = await db.User.findOne({ username });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updateData.username = username;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    if (req.file) {
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await db.User.findByIdAndUpdate(req.user.id, updateData);

    await db.History.create({
      userId: req.user.id,
      type: 'profile',
      action: 'Profile details updated',
      module: 'Profile',
      severity: 'info'
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        isVerified: updatedUser.isVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.History.deleteMany({ userId });
    await db.Report.deleteMany({ userId });
    await db.User.findByIdAndDelete(userId);

    res.clearCookie('token');
    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user) {
      await db.History.create({
        userId: req.user.id,
        type: 'login',
        action: 'User logged out',
        module: 'Auth',
        severity: 'info'
      });
    }
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findById(req.user.id);
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  deleteAccount,
  logout,
  getCurrentUser
};
