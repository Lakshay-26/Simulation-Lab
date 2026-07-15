const db = require('../config/db');

const getHistory = async (req, res) => {
  try {
    const { search, type, severity, sort, showDeleted } = req.query;
    const query = { userId: req.user.id };

    if (showDeleted === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true };
    }

    if (type) {
      query.type = type;
    }

    if (severity) {
      query.severity = severity;
    }

    let logs = await db.History.find(query);

    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => 
        (log.action && log.action.toLowerCase().includes(searchLower)) ||
        (log.module && log.module.toLowerCase().includes(searchLower))
      );
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    logs.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder * (dateB - dateA);
    });

    return res.status(200).json({ history: logs });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const log = await db.History.findById(req.params.id);
    if (!log || log.userId !== req.user.id) {
      return res.status(404).json({ message: 'Log not found' });
    }

    await db.History.findByIdAndUpdate(req.params.id, { isDeleted: true });
    return res.status(200).json({ message: 'Log item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const restoreHistory = async (req, res) => {
  try {
    const log = await db.History.findById(req.params.id);
    if (!log || log.userId !== req.user.id) {
      return res.status(404).json({ message: 'Log not found' });
    }

    await db.History.findByIdAndUpdate(req.params.id, { isDeleted: false });
    return res.status(200).json({ message: 'Log item restored successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const exportHistory = async (req, res) => {
  try {
    const logs = await db.History.find({ userId: req.user.id, isDeleted: { $ne: true } });
    const format = req.query.format || 'json';

    if (format === 'csv') {
      let csv = 'ID,Type,Action,Module,Severity,Date\n';
      logs.forEach(log => {
        csv += `"${log.id || log._id}","${log.type}","${log.action.replace(/"/g, '""')}","${log.module}","${log.severity}","${log.createdAt}"\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=security_simulation_history.csv');
      return res.status(200).send(csv);
    }

    return res.status(200).json({ history: logs });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getHistory,
  deleteHistory,
  restoreHistory,
  exportHistory
};
