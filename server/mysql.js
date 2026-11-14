import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  database: process.env.DB_NAME || "time_capsule",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;
let initPromise = null;

export function getMySQLConfig() {
  return DB_CONFIG;
}

export function isMySQLConnected() {
  return isConnected;
}

/**
 * Initializes MySQL database and all required tables
 */
export async function initMySQL(options = {}) {
  const silent = options.silent || false;
  try {
    // Step 1: Connect to MySQL server (without specifying DB) to ensure DB exists
    const serverConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      connectTimeout: 4000
    });

    await serverConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await serverConnection.end();

    // Step 2: Create connection pool with the database
    pool = mysql.createPool(DB_CONFIG);

    // Test connection
    const testConn = await pool.getConnection();
    testConn.release();

    // Step 3: Create tables
    await createTables();

    isConnected = true;
    if (!silent) {
      console.log(`[MySQL] Connected successfully to database "${DB_CONFIG.database}" on ${DB_CONFIG.host}:${DB_CONFIG.port}.`);
    }
    return true;
  } catch (err) {
    isConnected = false;
    if (!silent) {
      console.warn(`[MySQL] Warning: Could not connect to MySQL server (${err.code || err.message}). App running in fallback JSON storage mode.`);
    }
    return false;
  }
}

async function createTables() {
  if (!pool) return;

  const queries = [
    // 1. Users
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(100) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      role ENUM('user', 'admin') DEFAULT 'user',
      timezone VARCHAR(100) DEFAULT 'UTC',
      is_suspended TINYINT(1) DEFAULT 0,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_email (email),
      INDEX idx_users_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 2. Capsules
    `CREATE TABLE IF NOT EXISTS capsules (
      id VARCHAR(64) PRIMARY KEY,
      owner_id VARCHAR(64) NOT NULL,
      owner_name VARCHAR(255),
      owner_avatar TEXT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      cover_image TEXT,
      theme VARCHAR(100) DEFAULT 'cosmic-cyan',
      status ENUM('draft', 'sealed', 'unlocked', 'archived') DEFAULT 'draft',
      visibility ENUM('private', 'shared', 'public') DEFAULT 'private',
      unlock_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sealed_at DATETIME NULL,
      unlocked_at DATETIME NULL,
      timezone VARCHAR(100) DEFAULT 'UTC',
      is_archived TINYINT(1) DEFAULT 0,
      INDEX idx_capsules_owner (owner_id),
      INDEX idx_capsules_status (status),
      INDEX idx_capsules_unlock (unlock_at),
      INDEX idx_capsules_visibility (visibility)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 3. Memories
    `CREATE TABLE IF NOT EXISTS memories (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      uploaded_by VARCHAR(64) NOT NULL,
      uploader_name VARCHAR(255),
      file_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50),
      mime_type VARCHAR(100) NOT NULL,
      storage_path TEXT NOT NULL,
      file_size BIGINT NOT NULL,
      caption TEXT,
      description TEXT,
      is_favorite TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_memories_capsule (capsule_id),
      INDEX idx_memories_uploader (uploaded_by)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 4. Letters
    `CREATE TABLE IF NOT EXISTS letters (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      author_id VARCHAR(64) NOT NULL,
      author_name VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      prompt_used TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_letters_capsule (capsule_id),
      INDEX idx_letters_author (author_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 5. Capsule Members
    `CREATE TABLE IF NOT EXISTS capsule_members (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      role VARCHAR(50) DEFAULT 'contributor',
      user_email VARCHAR(255),
      user_name VARCHAR(255),
      user_avatar TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_capsule_user (capsule_id, user_id),
      INDEX idx_members_capsule (capsule_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 6. Capsule Invitations
    `CREATE TABLE IF NOT EXISTS capsule_invitations (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      capsule_title VARCHAR(255),
      inviter_id VARCHAR(64) NOT NULL,
      inviter_name VARCHAR(255),
      invitee_email VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'contributor',
      token VARCHAR(255) NOT NULL UNIQUE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      INDEX idx_invitations_token (token),
      INDEX idx_invitations_capsule (capsule_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 7. Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      type VARCHAR(100) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      capsule_id VARCHAR(64) NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notifications_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 8. Comments
    `CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      username VARCHAR(100),
      user_avatar TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_comments_capsule (capsule_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 9. Likes
    `CREATE TABLE IF NOT EXISTS likes (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_like (capsule_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 10. Bookmarks
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_bookmark (capsule_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 11. Reports
    `CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(64) PRIMARY KEY,
      capsule_id VARCHAR(64) NOT NULL,
      reported_by VARCHAR(64) NULL,
      reason VARCHAR(255) NOT NULL,
      details TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 12. Activity Logs
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NULL,
      username VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_activity_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 13. Notification Preferences
    `CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id VARCHAR(64) PRIMARY KEY,
      remind_7_days TINYINT(1) DEFAULT 1,
      remind_1_day TINYINT(1) DEFAULT 1,
      remind_on_unlock TINYINT(1) DEFAULT 1,
      email_notifications TINYINT(1) DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const query of queries) {
    await pool.query(query);
  }
}

/**
 * Format a JavaScript Date or ISO string into MySQL DATETIME ('YYYY-MM-DD HH:MM:SS')
 */
function toMySQLDateTime(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Sync entire in-memory / JSON dataset to MySQL
 */
export async function syncDataToMySQL(data) {
  if (!pool || !isConnected) return false;

  try {
    // 1. Users
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        await pool.query(
          `INSERT INTO users (id, email, username, full_name, avatar_url, bio, role, timezone, is_suspended, password_hash, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            email = VALUES(email), username = VALUES(username), full_name = VALUES(full_name),
            avatar_url = VALUES(avatar_url), bio = VALUES(bio), role = VALUES(role),
            timezone = VALUES(timezone), is_suspended = VALUES(is_suspended), password_hash = VALUES(password_hash);`,
          [
            u.id, u.email, u.username, u.full_name, u.avatar_url || null, u.bio || null,
            u.role || "user", u.timezone || "UTC", u.is_suspended ? 1 : 0, u.password_hash || "",
            toMySQLDateTime(u.created_at) || new Date()
          ]
        );
      }
    }

    // 2. Capsules
    if (Array.isArray(data.capsules)) {
      for (const c of data.capsules) {
        await pool.query(
          `INSERT INTO capsules (id, owner_id, owner_name, owner_avatar, title, description, category, cover_image, theme, status, visibility, unlock_at, created_at, sealed_at, unlocked_at, timezone, is_archived)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            owner_name = VALUES(owner_name), owner_avatar = VALUES(owner_avatar), title = VALUES(title),
            description = VALUES(description), category = VALUES(category), cover_image = VALUES(cover_image),
            theme = VALUES(theme), status = VALUES(status), visibility = VALUES(visibility),
            unlock_at = VALUES(unlock_at), sealed_at = VALUES(sealed_at), unlocked_at = VALUES(unlocked_at),
            timezone = VALUES(timezone), is_archived = VALUES(is_archived);`,
          [
            c.id, c.owner_id, c.owner_name || null, c.owner_avatar || null, c.title, c.description || null,
            c.category || "Personal", c.cover_image || null, c.theme || "cosmic-cyan", c.status || "draft",
            c.visibility || "private", toMySQLDateTime(c.unlock_at), toMySQLDateTime(c.created_at),
            toMySQLDateTime(c.sealed_at), toMySQLDateTime(c.unlocked_at), c.timezone || "UTC",
            c.is_archived ? 1 : 0
          ]
        );
      }
    }

    // 3. Memories
    if (Array.isArray(data.memories)) {
      for (const m of data.memories) {
        await pool.query(
          `INSERT INTO memories (id, capsule_id, uploaded_by, uploader_name, file_name, file_type, mime_type, storage_path, file_size, caption, description, is_favorite, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            caption = VALUES(caption), description = VALUES(description), is_favorite = VALUES(is_favorite);`,
          [
            m.id, m.capsule_id, m.uploaded_by, m.uploader_name || null, m.file_name, m.file_type || "image",
            m.mime_type || "image/jpeg", m.storage_path, m.file_size || 0, m.caption || null,
            m.description || null, m.is_favorite ? 1 : 0, toMySQLDateTime(m.created_at)
          ]
        );
      }
    }

    // 4. Letters
    if (Array.isArray(data.letters)) {
      for (const l of data.letters) {
        await pool.query(
          `INSERT INTO letters (id, capsule_id, author_id, author_name, title, content, prompt_used, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            title = VALUES(title), content = VALUES(content), prompt_used = VALUES(prompt_used), updated_at = VALUES(updated_at);`,
          [
            l.id, l.capsule_id, l.author_id, l.author_name || null, l.title, l.content,
            l.prompt_used || null, toMySQLDateTime(l.created_at), toMySQLDateTime(l.updated_at)
          ]
        );
      }
    }

    // 5. Capsule Members
    if (Array.isArray(data.capsule_members)) {
      for (const cm of data.capsule_members) {
        await pool.query(
          `INSERT INTO capsule_members (id, capsule_id, user_id, role, user_email, user_name, user_avatar, joined_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE role = VALUES(role);`,
          [
            cm.id, cm.capsule_id, cm.user_id, cm.role || "contributor", cm.user_email || null,
            cm.user_name || null, cm.user_avatar || null, toMySQLDateTime(cm.joined_at)
          ]
        );
      }
    }

    // 6. Capsule Invitations
    if (Array.isArray(data.capsule_invitations)) {
      for (const inv of data.capsule_invitations) {
        await pool.query(
          `INSERT INTO capsule_invitations (id, capsule_id, capsule_title, inviter_id, inviter_name, invitee_email, role, token, status, created_at, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status);`,
          [
            inv.id, inv.capsule_id, inv.capsule_title || null, inv.inviter_id, inv.inviter_name || null,
            inv.invitee_email, inv.role || "contributor", inv.token, inv.status || "pending",
            toMySQLDateTime(inv.created_at), toMySQLDateTime(inv.expires_at)
          ]
        );
      }
    }

    // 7. Notifications
    if (Array.isArray(data.notifications)) {
      for (const n of data.notifications) {
        await pool.query(
          `INSERT INTO notifications (id, user_id, type, title, message, capsule_id, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE is_read = VALUES(is_read);`,
          [
            n.id, n.user_id, n.type, n.title, n.message, n.capsule_id || null,
            n.is_read ? 1 : 0, toMySQLDateTime(n.created_at)
          ]
        );
      }
    }

    // 8. Comments
    if (Array.isArray(data.comments)) {
      for (const c of data.comments) {
        await pool.query(
          `INSERT INTO comments (id, capsule_id, user_id, username, user_avatar, content, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE content = VALUES(content);`,
          [
            c.id, c.capsule_id, c.user_id, c.username || null, c.user_avatar || null,
            c.content, toMySQLDateTime(c.created_at)
          ]
        );
      }
    }

    // 9. Likes
    if (Array.isArray(data.likes)) {
      for (const l of data.likes) {
        await pool.query(
          `INSERT IGNORE INTO likes (id, capsule_id, user_id, created_at) VALUES (?, ?, ?, ?);`,
          [l.id, l.capsule_id, l.user_id, toMySQLDateTime(l.created_at)]
        );
      }
    }

    // 10. Bookmarks
    if (Array.isArray(data.bookmarks)) {
      for (const b of data.bookmarks) {
        await pool.query(
          `INSERT IGNORE INTO bookmarks (id, capsule_id, user_id, created_at) VALUES (?, ?, ?, ?);`,
          [b.id, b.capsule_id, b.user_id, toMySQLDateTime(b.created_at)]
        );
      }
    }

    // 11. Reports
    if (Array.isArray(data.reports)) {
      for (const r of data.reports) {
        await pool.query(
          `INSERT INTO reports (id, capsule_id, reported_by, reason, details, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status);`,
          [r.id, r.capsule_id, r.reported_by || null, r.reason, r.details || null, r.status || "pending", toMySQLDateTime(r.created_at)]
        );
      }
    }

    // 12. Activity Logs
    if (Array.isArray(data.activity_logs)) {
      for (const act of data.activity_logs) {
        await pool.query(
          `INSERT IGNORE INTO activity_logs (id, user_id, username, action, details, timestamp)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [act.id, act.user_id || null, act.username || null, act.action, act.details || null, toMySQLDateTime(act.timestamp)]
        );
      }
    }

    // 13. Notification Preferences
    if (Array.isArray(data.notification_preferences)) {
      for (const np of data.notification_preferences) {
        await pool.query(
          `INSERT INTO notification_preferences (user_id, remind_7_days, remind_1_day, remind_on_unlock, email_notifications)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
            remind_7_days = VALUES(remind_7_days), remind_1_day = VALUES(remind_1_day),
            remind_on_unlock = VALUES(remind_on_unlock), email_notifications = VALUES(email_notifications);`,
          [np.user_id, np.remind_7_days ? 1 : 0, np.remind_1_day ? 1 : 0, np.remind_on_unlock ? 1 : 0, np.email_notifications ? 1 : 0]
        );
      }
    }

    return true;
  } catch (err) {
    console.error("[MySQL] Error syncing data to MySQL:", err.message);
    return false;
  }
}

/**
 * Load complete dataset from MySQL tables into app memory structure
 */
export async function loadDataFromMySQL() {
  if (!pool || !isConnected) return null;

  try {
    const [users] = await pool.query(`SELECT * FROM users;`);
    const [capsules] = await pool.query(`SELECT * FROM capsules;`);
    const [memories] = await pool.query(`SELECT * FROM memories;`);
    const [letters] = await pool.query(`SELECT * FROM letters;`);
    const [capsule_members] = await pool.query(`SELECT * FROM capsule_members;`);
    const [capsule_invitations] = await pool.query(`SELECT * FROM capsule_invitations;`);
    const [notifications] = await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC;`);
    const [comments] = await pool.query(`SELECT * FROM comments;`);
    const [likes] = await pool.query(`SELECT * FROM likes;`);
    const [bookmarks] = await pool.query(`SELECT * FROM bookmarks;`);
    const [reports] = await pool.query(`SELECT * FROM reports;`);
    const [activity_logs] = await pool.query(`SELECT * FROM activity_logs ORDER BY timestamp DESC;`);
    const [notification_preferences] = await pool.query(`SELECT * FROM notification_preferences;`);

    // Normalize types (e.g. booleans, ISO strings)
    const normalizedCapsules = capsules.map(c => ({
      ...c,
      is_archived: Boolean(c.is_archived),
      unlock_at: c.unlock_at ? new Date(c.unlock_at).toISOString() : null,
      created_at: c.created_at ? new Date(c.created_at).toISOString() : null,
      sealed_at: c.sealed_at ? new Date(c.sealed_at).toISOString() : null,
      unlocked_at: c.unlocked_at ? new Date(c.unlocked_at).toISOString() : null
    }));

    const normalizedMemories = memories.map(m => ({
      ...m,
      is_favorite: Boolean(m.is_favorite),
      created_at: m.created_at ? new Date(m.created_at).toISOString() : null
    }));

    const normalizedUsers = users.map(u => ({
      ...u,
      is_suspended: Boolean(u.is_suspended),
      created_at: u.created_at ? new Date(u.created_at).toISOString() : null
    }));

    const normalizedNotifications = notifications.map(n => ({
      ...n,
      is_read: Boolean(n.is_read),
      created_at: n.created_at ? new Date(n.created_at).toISOString() : null
    }));

    const normalizedPreferences = notification_preferences.map(p => ({
      ...p,
      remind_7_days: Boolean(p.remind_7_days),
      remind_1_day: Boolean(p.remind_1_day),
      remind_on_unlock: Boolean(p.remind_on_unlock),
      email_notifications: Boolean(p.email_notifications)
    }));

    return {
      users: normalizedUsers,
      capsules: normalizedCapsules,
      memories: normalizedMemories,
      letters,
      capsule_members,
      capsule_invitations,
      notifications: normalizedNotifications,
      comments,
      likes,
      bookmarks,
      reports,
      activity_logs,
      notification_preferences: normalizedPreferences
    };
  } catch (err) {
    console.error("[MySQL] Failed to load data from MySQL:", err.message);
    return null;
  }
}


/**
 * Find a user in MySQL by email
 */
export async function findUserByEmailFromMySQL(email) {
  if (!pool || !isConnected) return null;
  try {
    const [rows] = await pool.query(`SELECT * FROM users WHERE LOWER(email) = LOWER(?);`, [email]);
    if (rows && rows.length > 0) {
      const u = rows[0];
      return {
        ...u,
        is_suspended: Boolean(u.is_suspended),
        created_at: u.created_at ? new Date(u.created_at).toISOString() : null
      };
    }
  } catch (err) {
    console.error("[MySQL] findUserByEmail error:", err.message);
  }
  return null;
}

/**
 * Find a user in MySQL by ID
 */
export async function findUserByIdFromMySQL(id) {
  if (!pool || !isConnected) return null;
  try {
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?;`, [id]);
    if (rows && rows.length > 0) {
      const u = rows[0];
      return {
        ...u,
        is_suspended: Boolean(u.is_suspended),
        created_at: u.created_at ? new Date(u.created_at).toISOString() : null
      };
    }
  } catch (err) {
    console.error("[MySQL] findUserById error:", err.message);
  }
  return null;
}
