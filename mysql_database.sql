-- =========================================================================
-- Digital Time Capsule: Complete MySQL 8.0+ Database Schema & Seed Data
-- Database Name: time_capsule
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `time_capsule`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `time_capsule`;

-- 1. USERS TABLE
DROP TABLE IF EXISTS `notification_preferences`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `bookmarks`;
DROP TABLE IF EXISTS `likes`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `capsule_invitations`;
DROP TABLE IF EXISTS `capsule_members`;
DROP TABLE IF EXISTS `letters`;
DROP TABLE IF EXISTS `memories`;
DROP TABLE IF EXISTS `capsules`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `avatar_url` TEXT,
  `bio` TEXT,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `timezone` VARCHAR(100) DEFAULT 'UTC',
  `is_suspended` TINYINT(1) DEFAULT 0,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CAPSULES TABLE
CREATE TABLE `capsules` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `owner_id` VARCHAR(64) NOT NULL,
  `owner_name` VARCHAR(255),
  `owner_avatar` TEXT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `cover_image` TEXT,
  `theme` VARCHAR(100) DEFAULT 'cosmic-cyan',
  `status` ENUM('draft', 'sealed', 'unlocked', 'archived') DEFAULT 'draft',
  `visibility` ENUM('private', 'shared', 'public') DEFAULT 'private',
  `unlock_at` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `sealed_at` DATETIME NULL,
  `unlocked_at` DATETIME NULL,
  `timezone` VARCHAR(100) DEFAULT 'UTC',
  `is_archived` TINYINT(1) DEFAULT 0,
  INDEX `idx_capsules_owner` (`owner_id`),
  INDEX `idx_capsules_status` (`status`),
  INDEX `idx_capsules_unlock` (`unlock_at`),
  INDEX `idx_capsules_visibility` (`visibility`),
  CONSTRAINT `fk_capsules_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MEMORIES TABLE (Files, Photos, Audio, Documents)
CREATE TABLE `memories` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `uploaded_by` VARCHAR(64) NOT NULL,
  `uploader_name` VARCHAR(255),
  `file_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) DEFAULT 'image',
  `mime_type` VARCHAR(100) NOT NULL,
  `storage_path` TEXT NOT NULL,
  `file_size` BIGINT NOT NULL DEFAULT 0,
  `caption` TEXT,
  `description` TEXT,
  `is_favorite` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_memories_capsule` (`capsule_id`),
  INDEX `idx_memories_uploader` (`uploaded_by`),
  CONSTRAINT `fk_memories_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LETTERS TABLE (Future Letters / Time Stasis Messages)
CREATE TABLE `letters` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `author_id` VARCHAR(64) NOT NULL,
  `author_name` VARCHAR(255),
  `title` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `prompt_used` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_letters_capsule` (`capsule_id`),
  INDEX `idx_letters_author` (`author_id`),
  CONSTRAINT `fk_letters_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CAPSULE MEMBERS TABLE (Collaborators)
CREATE TABLE `capsule_members` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'contributor',
  `user_email` VARCHAR(255),
  `user_name` VARCHAR(255),
  `user_avatar` TEXT,
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_capsule_user` (`capsule_id`, `user_id`),
  INDEX `idx_members_capsule` (`capsule_id`),
  CONSTRAINT `fk_members_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. CAPSULE INVITATIONS TABLE
CREATE TABLE `capsule_invitations` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `capsule_title` VARCHAR(255),
  `inviter_id` VARCHAR(64) NOT NULL,
  `inviter_name` VARCHAR(255),
  `invitee_email` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'contributor',
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `status` VARCHAR(50) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  INDEX `idx_invitations_token` (`token`),
  INDEX `idx_invitations_capsule` (`capsule_id`),
  CONSTRAINT `fk_invitations_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. NOTIFICATIONS TABLE
CREATE TABLE `notifications` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `capsule_id` VARCHAR(64) NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. COMMENTS TABLE (Public Capsules)
CREATE TABLE `comments` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(100),
  `user_avatar` TEXT,
  `content` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comments_capsule` (`capsule_id`),
  CONSTRAINT `fk_comments_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. LIKES TABLE
CREATE TABLE `likes` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_capsule_like` (`capsule_id`, `user_id`),
  CONSTRAINT `fk_likes_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BOOKMARKS TABLE
CREATE TABLE `bookmarks` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_capsule_bookmark` (`capsule_id`, `user_id`),
  CONSTRAINT `fk_bookmarks_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. REPORTS TABLE (Moderation)
CREATE TABLE `reports` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `capsule_id` VARCHAR(64) NOT NULL,
  `reported_by` VARCHAR(64) NULL,
  `reason` VARCHAR(255) NOT NULL,
  `details` TEXT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reports_capsule` FOREIGN KEY (`capsule_id`) REFERENCES `capsules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. ACTIVITY LOGS TABLE
CREATE TABLE `activity_logs` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NULL,
  `username` VARCHAR(100),
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_activity_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. NOTIFICATION PREFERENCES TABLE
CREATE TABLE `notification_preferences` (
  `user_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `remind_7_days` TINYINT(1) DEFAULT 1,
  `remind_1_day` TINYINT(1) DEFAULT 1,
  `remind_on_unlock` TINYINT(1) DEFAULT 1,
  `email_notifications` TINYINT(1) DEFAULT 1,
  CONSTRAINT `fk_pref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA (Default Admin & Demo Accounts)
-- =========================================================================

INSERT INTO `users` (`id`, `email`, `username`, `full_name`, `avatar_url`, `bio`, `role`, `timezone`, `password_hash`, `created_at`) VALUES
('usr_admin_01', 'admin@timecapsule.com', 'admin', 'Administrator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Platform Overseer & Custodian of Eternal Memories', 'admin', 'America/New_York', '$2a$10$wO3P8G93k7K69zK5p0zL1e3uM.Qd1qM.Qd1qM.Qd1qM.Qd1qM.Qd1', NOW() - INTERVAL 60 DAY),
('usr_demo_02', 'alex@timecapsule.com', 'alex_starlight', 'Alex Vance', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'Star gazer, photographer, time traveler at heart.', 'user', 'America/New_York', '$2a$10$wO3P8G93k7K69zK5p0zL1e3uM.Qd1qM.Qd1qM.Qd1qM.Qd1qM.Qd1', NOW() - INTERVAL 30 DAY),
('usr_contributor_03', 'elena@timecapsule.com', 'elena_sky', 'Elena Rostova', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Wanderer across mountain trails and old books.', 'user', 'Europe/London', '$2a$10$wO3P8G93k7K69zK5p0zL1e3uM.Qd1qM.Qd1qM.Qd1qM.Qd1qM.Qd1', NOW() - INTERVAL 25 DAY);

INSERT INTO `capsules` (`id`, `owner_id`, `owner_name`, `owner_avatar`, `title`, `description`, `category`, `cover_image`, `theme`, `status`, `visibility`, `unlock_at`, `created_at`, `sealed_at`, `unlocked_at`) VALUES
('cap_unlocked_01', 'usr_demo_02', 'Alex Vance', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'Our Pacific Coast Odyssey 2024', 'A 2,000-mile road trip down Highway 1. Sealed when we felt on top of the world.', 'Travel', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', 'cosmic-cyan', 'unlocked', 'public', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 3 DAY),
('cap_sealed_soon_02', 'usr_demo_02', 'Alex Vance', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'Letter to My 30th Birthday Self', 'Reflections on ambition, fear, love, and what matters most.', 'Personal', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', 'neon-purple', 'sealed', 'private', NOW() + INTERVAL 1 YEAR, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY, NULL);

INSERT INTO `letters` (`id`, `capsule_id`, `author_id`, `author_name`, `title`, `content`, `prompt_used`, `created_at`) VALUES
('let_01', 'cap_unlocked_01', 'usr_demo_02', 'Alex Vance', 'To the travelers we are becoming', 'Dear Future Self,\n\nIf you are reading this, time has slipped past like sand through cupped hands. Remember the salt spray in Monterey? Keep wandering.\n\nWith unconditional love,\nYour 2024 Self', 'What do you hope your future self remembers?', NOW() - INTERVAL 45 DAY),
('let_02', 'cap_sealed_soon_02', 'usr_demo_02', 'Alex Vance', 'Unlocking the 30s: No Regrets', 'Hello Alex!\nToday you turn a new chapter. We worried so much about having everything figured out. Did we solve the puzzle? Probably not, and that is okay.', 'What are your biggest dreams?', NOW() - INTERVAL 10 DAY);

INSERT INTO `memories` (`id`, `capsule_id`, `uploaded_by`, `uploader_name`, `file_name`, `file_type`, `mime_type`, `storage_path`, `file_size`, `caption`, `description`, `is_favorite`, `created_at`) VALUES
('mem_01', 'cap_unlocked_01', 'usr_demo_02', 'Alex Vance', 'Big_Sur_Sunset.jpg', 'image', 'image/jpeg', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80', 2450000, 'The moment the sun touched the Pacific at Big Sur cliff.', 'We had been driving for 7 hours, windows down, salty air filling the cabin.', 1, NOW() - INTERVAL 45 DAY),
('mem_02', 'cap_unlocked_01', 'usr_demo_02', 'Alex Vance', 'Redwood_Canopy_Walk.jpg', 'image', 'image/jpeg', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80', 3100000, 'Walking amongst giants older than civilization itself.', 'Felt tiny and at peace.', 1, NOW() - INTERVAL 44 DAY);

INSERT INTO `notification_preferences` (`user_id`, `remind_7_days`, `remind_1_day`, `remind_on_unlock`, `email_notifications`) VALUES
('usr_demo_02', 1, 1, 1, 1);

