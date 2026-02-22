  try {
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();
    const hasPermissions = tableInfo.some(col => col.name === 'permissions');
    const hasLastLogin = tableInfo.some(col => col.name === 'last_login');

    if (!hasPermissions) {
      console.log('🔄 Migrating: Adding permissions column to users table...');
      db.prepare('ALTER TABLE users ADD COLUMN permissions TEXT').run();
      console.log('✅ Migration successful: permissions column added.');
    }

    if (!hasLastLogin) {
      console.log('🔄 Migrating: Adding last_login column to users table...');
      db.prepare('ALTER TABLE users ADD COLUMN last_login DATETIME').run();
      console.log('✅ Migration successful: last_login column added.');
    }

    // Devices table migrations
    const devicesTableInfo = db.prepare('PRAGMA table_info(devices)').all();
    const hasDeviceCategory = devicesTableInfo.some(col => col.name === 'device_category');
    const hasVendorId = devicesTableInfo.some(col => col.name === 'vendor_id');
    const hasProductId = devicesTableInfo.some(col => col.name === 'product_id');

    if (!hasDeviceCategory) {
      console.log('🔄 Migrating: Adding device_category to devices table...');
      db.prepare("ALTER TABLE devices ADD COLUMN device_category TEXT DEFAULT 'software'").run();
      console.log('✅ Migration successful: device_category added.');
    }

    if (!hasVendorId) {
      console.log('🔄 Migrating: Adding vendor_id to devices table...');
      db.prepare('ALTER TABLE devices ADD COLUMN vendor_id TEXT').run();
      console.log('✅ Migration successful: vendor_id added.');
    }

    if (!hasProductId) {
      console.log('🔄 Migrating: Adding product_id to devices table...');
      db.prepare('ALTER TABLE devices ADD COLUMN product_id TEXT').run();
      db.prepare('ALTER TABLE devices ADD COLUMN path TEXT').run(); // Assuming path is also missing if product_id is
      db.prepare('ALTER TABLE devices ADD COLUMN last_active DATETIME DEFAULT CURRENT_TIMESTAMP').run();
      console.log('✅ Migration successful: product_id, path, last_active added.');
    }

    // Activity Logs table (Migration)
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_logs'").get();
    if (!tableExists) {
      console.log('🔄 Migrating: Creating activity_logs table...');
      db.exec(`
            CREATE TABLE IF NOT EXISTS activity_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              action TEXT NOT NULL,
              details TEXT,
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);
      console.log('✅ Migration successful: activity_logs table created.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
