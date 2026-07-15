const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collectionName) {
  return path.join(DATA_DIR, `${collectionName}.json`);
}

function readData(collectionName) {
  const filePath = getFilePath(collectionName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (error) {
    return [];
  }
}

function writeData(collectionName, data) {
  const filePath = getFilePath(collectionName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

class JsonCollection {
  constructor(name) {
    this.name = name;
  }

  async find(query = {}) {
    const data = readData(this.name);
    const getValueByPath = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };
    return data.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined) {
          const qVal = query[key];
          const iVal = key.includes('.') ? getValueByPath(item, key) : item[key];
          if (qVal && typeof qVal === 'object' && !Array.isArray(qVal)) {
            if ('$ne' in qVal) {
              if (iVal === qVal['$ne']) return false;
            } else if ('$in' in qVal) {
              if (!Array.isArray(qVal['$in']) || !qVal['$in'].includes(iVal)) return false;
            }
          } else {
            if (iVal !== qVal) return false;
          }
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    return this.findOne({ id });
  }

  async create(doc) {
    const data = readData(this.name);
    const newDoc = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    data.push(newDoc);
    writeData(this.name, data);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const data = readData(this.name);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    data[index] = {
      ...data[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    writeData(this.name, data);
    return data[index];
  }

  async findByIdAndDelete(id) {
    const data = readData(this.name);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    const deleted = data.splice(index, 1)[0];
    writeData(this.name, data);
    return deleted;
  }

  async deleteMany(query = {}) {
    const data = readData(this.name);
    const remaining = data.filter(item => {
      for (const key in query) {
        if (item[key] === query[key]) {
          return false;
        }
      }
      return true;
    });
    writeData(this.name, remaining);
    return { deletedCount: data.length - remaining.length };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }
}

module.exports = {
  User: new JsonCollection('users'),
  History: new JsonCollection('history'),
  Report: new JsonCollection('reports'),
  SystemLog: new JsonCollection('system_logs')
};
