const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isFallback } = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'folio-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB structure
let cache = {
  users: [],
  notes: [],
  collections: [],
  noterevisions: [],
  mindmaps: []
};

// Load cache from disk if file exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    cache = JSON.parse(raw);
    for (const key of ['users', 'notes', 'collections', 'noterevisions', 'mindmaps']) {
      if (!cache[key]) cache[key] = [];
    }
  } catch (err) {
    console.error('Error loading fallback db file, initializing new cache:', err);
  }
} else {
  fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

const persist = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error('Error persisting database:', err);
  }
};

const generateId = () => {
  return crypto.randomBytes(12).toString('hex');
};

const matchesFilter = (item, filter = {}) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(value)) {
      const orMatched = value.some(subFilter => matchesFilter(item, subFilter));
      if (!orMatched) return false;
      continue;
    }

    if (key === '_id' || key === 'id') {
      const targetId = String(value._id || value);
      const itemId = String(item._id || item.id);
      if (itemId !== targetId) return false;
      continue;
    }

    const itemVal = item[key];

    if (value && typeof value === 'object' && !(value instanceof RegExp)) {
      if ('$in' in value) {
        const arr = value.$in.map(String);
        if (Array.isArray(itemVal)) {
          const hasCommon = itemVal.some(v => arr.includes(String(v)));
          if (!hasCommon) return false;
        } else {
          if (!arr.includes(String(itemVal))) return false;
        }
        continue;
      }

      if ('$regex' in value) {
        const options = value.$options || '';
        const regex = new RegExp(value.$regex, options);
        if (!regex.test(String(itemVal || ''))) return false;
        continue;
      }

      if ('$ne' in value) {
        if (String(itemVal) === String(value.$ne)) return false;
        continue;
      }
    }

    if (value instanceof RegExp) {
      if (!value.test(String(itemVal || ''))) return false;
      continue;
    }

    if (String(itemVal) !== String(value)) {
      return false;
    }
  }

  return true;
};

class EmbeddedModel {
  constructor(collectionName, mongooseModel) {
    this.collectionName = collectionName;
    this.mongooseModel = mongooseModel;
  }

  get items() {
    return cache[this.collectionName] || [];
  }

  async find(filter = {}) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.find(filter);
    }

    let results = this.items.filter(item => matchesFilter(item, filter));

    return {
      sort: (sortObj = {}) => {
        const sortKeys = Object.entries(sortObj);
        if (sortKeys.length > 0) {
          results.sort((a, b) => {
            for (const [key, dir] of sortKeys) {
              const valA = a[key];
              const valB = b[key];
              if (valA < valB) return dir === 1 || dir === 'asc' ? -1 : 1;
              if (valA > valB) return dir === 1 || dir === 'asc' ? 1 : -1;
            }
            return 0;
          });
        }
        return {
          limit: (n) => results.slice(0, n),
          skip: (n) => results.slice(n),
          lean: () => results,
          populate: () => results,
          exec: async () => results,
          then: (resolve) => resolve(results)
        };
      },
      limit: (n) => results.slice(0, n),
      lean: () => results,
      populate: () => results,
      exec: async () => results,
      then: (resolve) => resolve(results)
    };
  }

  async findOne(filter = {}) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.findOne(filter);
    }
    const item = this.items.find(item => matchesFilter(item, filter));
    return item ? { ...item } : null;
  }

  async findById(id) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.findById(id);
    }
    const strId = String(id);
    const item = this.items.find(item => String(item._id) === strId || String(item.id) === strId);
    return item ? { ...item } : null;
  }

  async create(data) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.create(data);
    }
    const now = new Date();
    const doc = {
      _id: generateId(),
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now
    };
    cache[this.collectionName].push(doc);
    persist();
    return { ...doc };
  }

  async insertMany(docs) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.insertMany(docs);
    }
    const created = [];
    const now = new Date();
    for (const d of docs) {
      const doc = {
        _id: d._id || generateId(),
        ...d,
        createdAt: d.createdAt || now,
        updatedAt: d.updatedAt || now
      };
      cache[this.collectionName].push(doc);
      created.push(doc);
    }
    persist();
    return created;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.findByIdAndUpdate(id, update, options);
    }
    const strId = String(id);
    const index = this.items.findIndex(item => String(item._id) === strId || String(item.id) === strId);
    if (index === -1) return null;

    const current = this.items[index];
    const updatePayload = update.$set ? { ...update.$set } : { ...update };
    delete updatePayload._id;
    updatePayload.updatedAt = new Date();

    const updated = {
      ...current,
      ...updatePayload
    };

    cache[this.collectionName][index] = updated;
    persist();
    return { ...updated };
  }

  async findByIdAndDelete(id) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.findByIdAndDelete(id);
    }
    const strId = String(id);
    const index = this.items.findIndex(item => String(item._id) === strId || String(item.id) === strId);
    if (index === -1) return null;
    const removed = cache[this.collectionName].splice(index, 1)[0];
    persist();
    return removed;
  }

  async deleteMany(filter = {}) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.deleteMany(filter);
    }
    const initialCount = this.items.length;
    cache[this.collectionName] = this.items.filter(item => !matchesFilter(item, filter));
    const deletedCount = initialCount - cache[this.collectionName].length;
    persist();
    return { deletedCount };
  }

  async countDocuments(filter = {}) {
    if (!isFallback() && this.mongooseModel) {
      return this.mongooseModel.countDocuments(filter);
    }
    return this.items.filter(item => matchesFilter(item, filter)).length;
  }
}

module.exports = {
  EmbeddedModel,
  getCache: () => cache,
  resetCache: () => {
    cache = { users: [], notes: [], collections: [], noterevisions: [], mindmaps: [] };
    persist();
  }
};
