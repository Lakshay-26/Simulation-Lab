const mongoose = require('mongoose');
const jsonDb = require('../utils/jsonDb');

let useMongo = false;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'analyst', 'admin'], default: 'student' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
  activeDefenses: { type: Array, default: [] }
}, { timestamps: true });

const historySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, default: '' },
  severity: { type: String, default: 'info' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  studentName: { type: String, default: '' },
  findings: { type: Array, default: [] },
  recommendations: { type: Array, default: [] },
  chartData: { type: mongoose.Schema.Types.Mixed, default: {} },
  pdfPath: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const systemLogSchema = new mongoose.Schema({
  userId: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  route: { type: String, default: '' },
  method: { type: String, default: '' }
}, { timestamps: true });

let UserModel, HistoryModel, ReportModel, SystemLogModel;

async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/security_simulation';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    useMongo = true;
    UserModel = mongoose.model('User', userSchema);
    HistoryModel = mongoose.model('History', historySchema);
    ReportModel = mongoose.model('Report', reportSchema);
    SystemLogModel = mongoose.model('SystemLog', systemLogSchema);
  } catch (error) {
    useMongo = false;
  }
}

const dbGateway = (collectionName, getModel) => {
  return {
    find: async (query = {}) => {
      if (useMongo) {
        return getModel().find(query).lean();
      }
      return jsonDb[collectionName].find(query);
    },
    findOne: async (query = {}) => {
      if (useMongo) {
        return getModel().findOne(query).lean();
      }
      return jsonDb[collectionName].findOne(query);
    },
    findById: async (id) => {
      if (useMongo) {
        return getModel().findById(id).lean();
      }
      return jsonDb[collectionName].findById(id);
    },
    create: async (doc) => {
      if (useMongo) {
        const created = await getModel().create(doc);
        return created.toObject();
      }
      return jsonDb[collectionName].create(doc);
    },
    findByIdAndUpdate: async (id, update) => {
      if (useMongo) {
        return getModel().findByIdAndUpdate(id, update, { new: true }).lean();
      }
      return jsonDb[collectionName].findByIdAndUpdate(id, update);
    },
    findByIdAndDelete: async (id) => {
      if (useMongo) {
        return getModel().findByIdAndDelete(id).lean();
      }
      return jsonDb[collectionName].findByIdAndDelete(id);
    },
    deleteMany: async (query = {}) => {
      if (useMongo) {
        return getModel().deleteMany(query);
      }
      return jsonDb[collectionName].deleteMany(query);
    },
    countDocuments: async (query = {}) => {
      if (useMongo) {
        return getModel().countDocuments(query);
      }
      return jsonDb[collectionName].countDocuments(query);
    }
  };
};

module.exports = {
  connectDB,
  isUsingMongo: () => useMongo,
  User: dbGateway('User', () => UserModel),
  History: dbGateway('History', () => HistoryModel),
  Report: dbGateway('Report', () => ReportModel),
  SystemLog: dbGateway('SystemLog', () => SystemLogModel)
};
