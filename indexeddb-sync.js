// IndexedDB configuration
const DB_NAME = 'WebAppMarketDB';
const DB_VERSION = 1;
const SYNC_FILE_PATH = '/sync/WebAppMarketDB.json';

// Store configurations
const STORES = [
  { name: 'activities', keyPath: 'id', autoIncrement: true, indexes: ['timestamp', 'user'] },
  { name: 'blogs', keyPath: 'id', autoIncrement: true, indexes: ['createdAt', 'title'] },
  { name: 'comments', keyPath: 'id', autoIncrement: true, indexes: ['productId', 'userId'] },
  { name: 'likes', keyPath: 'id', autoIncrement: true, indexes: ['productId', 'userId'] },
  { name: 'products', keyPath: 'id', autoIncrement: true, indexes: ['price', 'title'] },
  { name: 'users', keyPath: 'email', autoIncrement: false, indexes: ['name', 'role'] }
];

// Initialize the database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening database:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log('Database opened successfully');
      
      // Set up sync on database changes
      db.onversionchange = () => {
        db.close();
        console.log('Database is outdated, please reload the page.');
      };
      
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('Database upgrade needed');
      
      // Create object stores and indexes
      STORES.forEach(store => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, { 
            keyPath: store.keyPath, 
            autoIncrement: store.autoIncrement 
          });
          
          // Create indexes
          store.indexes.forEach(indexName => {
            objectStore.createIndex(indexName, indexName, { unique: false });
          });
          
          console.log(`Object store ${store.name} created`);
        }
      });
    };
  });
}

// Export all data from IndexedDB to a JSON file
async function exportToJson(db) {
  try {
    const data = {};
    
    // Extract data from each store
    for (const store of STORES) {
      data[store.name] = await getAllRecords(db, store.name);
    }
    
    // Convert to JSON and save to file
    const jsonData = JSON.stringify(data, null, 2);
    await saveToFile(jsonData);
    
    console.log('Database exported to JSON successfully');
    return true;
  } catch (error) {
    console.error('Error exporting database:', error);
    return false;
  }
}

// Import data from JSON file to IndexedDB
async function importFromJson(db) {
  try {
    const jsonData = await loadFromFile();
    if (!jsonData) {
      console.log('No sync file found, skipping import');
      return false;
    }
    
    const data = JSON.parse(jsonData);
    
    // Clear and populate each store
    for (const store of STORES) {
      if (data[store.name] && Array.isArray(data[store.name])) {
        await clearStore(db, store.name);
        await addRecords(db, store.name, data[store.name]);
      }
    }
    
    console.log('Database imported from JSON successfully');
    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    return false;
  }
}

// Get all records from a store
function getAllRecords(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Clear all records from a store
function clearStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Add multiple records to a store
function addRecords(db, storeName, records) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    let completed = 0;
    let errors = 0;
    
    transaction.oncomplete = () => {
      resolve();
    };
    
    transaction.onerror = (event) => {
      reject(event.target.error);
    };
    
    records.forEach(record => {
      const request = store.add(record);
      
      request.onsuccess = () => {
        completed++;
      };
      
      request.onerror = (event) => {
        console.error(`Error adding record to ${storeName}:`, event.target.error);
        errors++;
      };
    });
  });
}

// Save data to the sync file
async function saveToFile(jsonData) {
  try {
    const response = await fetch(SYNC_FILE_PATH, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to file:', error);
    return false;
  }
}

// Load data from the sync file
async function loadFromFile() {
  try {
    const response = await fetch(SYNC_FILE_PATH);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Sync file not found');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error loading from file:', error);
    return null;
  }
}

// Create a wrapper for database operations that automatically syncs changes
function createSyncedStore(db, storeName) {
  return {
    add: async (record) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(record);
        
        request.onsuccess = async (event) => {
          await exportToJson(db);
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    },
    
    put: async (record) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(record);
        
        request.onsuccess = async (event) => {
          await exportToJson(db);
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    },
    
    delete: async (key) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = async () => {
          await exportToJson(db);
          resolve();
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    },
    
    get: (key) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    },
    
    getAll: () => {
      return getAllRecords(db, storeName);
    },
    
    getByIndex: (indexName, value) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    },
    
    clear: async () => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = async () => {
          await exportToJson(db);
          resolve();
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }
  };
}

// Initialize the database and sync system
async function initSync() {
  try {
    // Create directory if it doesn't exist
    try {
      await fetch('/sync/', { method: 'HEAD' });
    } catch (error) {
      console.log('Creating sync directory');
      await fetch('/sync/', { method: 'MKCOL' });
    }
    
    // Initialize database
    const db = await initDatabase();
    
    // Import data from JSON file if available
    await importFromJson(db);
    
    // Create synced stores
    const stores = {};
    STORES.forEach(store => {
      stores[store.name] = createSyncedStore(db, store.name);
    });
    
    // Add the sync function to the stores object
    stores.sync = async () => {
      return await exportToJson(db);
    };
    
    // Add the database instance to the stores object
    stores.db = db;
    
    return stores;
  } catch (error) {
    console.error('Error initializing sync:', error);
    throw error;
  }
}

// Export the initialization function
window.initWebAppMarketDBSync = initSync;