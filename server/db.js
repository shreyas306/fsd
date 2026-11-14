import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");
class DatabaseManager {
  data;
  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
    if (this.data.users.length === 0) {
      this.seedInitialData();
    }
  }
  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = path.resolve(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }
  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(content);
      }
    } catch (err) {
      console.error("Error reading database file, initializing empty:", err);
    }
    return {
      users: [],
      capsules: [],
      memories: [],
      letters: [],
      capsule_members: [],
      capsule_invitations: [],
      notifications: [],
      comments: [],
      likes: [],
      bookmarks: [],
      reports: [],
      activity_logs: [],
      notification_preferences: []
    };
  }
  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing database file:", err);
    }
  }
  getData() {
    return this.data;
  }
  seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    const userPasswordHash = bcrypt.hashSync("password123", 10);
    const adminUser = {
      id: "usr_admin_01",
      email: "admin@timecapsule.com",
      username: "admin",
      full_name: "Administrator",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Platform Overseer & Custodian of Eternal Memories",
      role: "admin",
      timezone: "America/New_York",
      created_at: new Date(Date.now() - 60 * 864e5).toISOString(),
      password_hash: adminPasswordHash
    };
    const demoUser = {
      id: "usr_demo_02",
      email: "alex@timecapsule.com",
      username: "alex_starlight",
      full_name: "Alex Vance",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      bio: "Star gazer, photographer, time traveler at heart.",
      role: "user",
      timezone: "America/New_York",
      created_at: new Date(Date.now() - 30 * 864e5).toISOString(),
      password_hash: userPasswordHash
    };
    const contributorUser = {
      id: "usr_contributor_03",
      email: "elena@timecapsule.com",
      username: "elena_sky",
      full_name: "Elena Rostova",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      bio: "Wanderer across mountain trails and old books.",
      role: "user",
      timezone: "Europe/London",
      created_at: new Date(Date.now() - 25 * 864e5).toISOString(),
      password_hash: userPasswordHash
    };
    this.data.users.push(adminUser, demoUser, contributorUser);
    const cap1Unlocked = {
      id: "cap_unlocked_01",
      owner_id: demoUser.id,
      owner_name: demoUser.full_name,
      owner_avatar: demoUser.avatar_url,
      title: "Our Pacific Coast Odyssey 2024",
      description: "A 2,000-mile road trip down Highway 1. Sealed when we felt on top of the world.",
      category: "Travel",
      cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      theme: "cosmic-cyan",
      status: "unlocked",
      visibility: "public",
      unlock_at: new Date(Date.now() - 864e5 * 3).toISOString(),
      created_at: new Date(Date.now() - 864e5 * 45).toISOString(),
      sealed_at: new Date(Date.now() - 864e5 * 45).toISOString(),
      unlocked_at: new Date(Date.now() - 864e5 * 3).toISOString(),
      timezone: "America/New_York",
      is_archived: false
    };
    const cap2Soon = {
      id: "cap_sealed_soon_02",
      owner_id: demoUser.id,
      owner_name: demoUser.full_name,
      owner_avatar: demoUser.avatar_url,
      title: "Letter to My 30th Birthday Self",
      description: "Reflections on ambition, fear, love, and what matters most.",
      category: "Personal",
      cover_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      theme: "neon-purple",
      status: "sealed",
      visibility: "private",
      unlock_at: new Date(Date.now() + 180 * 1e3).toISOString(),
      // 3 minutes from now
      created_at: new Date(Date.now() - 864e5 * 10).toISOString(),
      sealed_at: new Date(Date.now() - 864e5 * 10).toISOString(),
      timezone: "America/New_York",
      is_archived: false
    };
    const cap3Shared = {
      id: "cap_shared_03",
      owner_id: demoUser.id,
      owner_name: demoUser.full_name,
      owner_avatar: demoUser.avatar_url,
      title: "Starlight Expedition: Founders Vault",
      description: "Our first year building the company together. Hidden thoughts and promises.",
      category: "Special Moments",
      cover_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      theme: "cosmic-cyan",
      status: "sealed",
      visibility: "shared",
      unlock_at: new Date(Date.now() + 864e5 * 365).toISOString(),
      created_at: new Date(Date.now() - 864e5 * 5).toISOString(),
      sealed_at: new Date(Date.now() - 864e5 * 5).toISOString(),
      timezone: "America/New_York",
      is_archived: false
    };
    const cap4Draft = {
      id: "cap_draft_04",
      owner_id: demoUser.id,
      owner_name: demoUser.full_name,
      owner_avatar: demoUser.avatar_url,
      title: "Graduation Summer Vibes",
      description: "Draft notes and photos from our graduation ceremony.",
      category: "Graduation",
      cover_image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
      theme: "aurora-pink",
      status: "draft",
      visibility: "private",
      unlock_at: new Date(Date.now() + 864e5 * 180).toISOString(),
      created_at: new Date(Date.now() - 864e5 * 1).toISOString(),
      timezone: "America/New_York",
      is_archived: false
    };
    this.data.capsules.push(cap1Unlocked, cap2Soon, cap3Shared, cap4Draft);
    const mem1 = {
      id: "mem_01",
      capsule_id: cap1Unlocked.id,
      uploaded_by: demoUser.id,
      uploader_name: demoUser.full_name,
      file_name: "Big_Sur_Sunset.jpg",
      file_type: "image",
      mime_type: "image/jpeg",
      storage_path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
      file_size: 245e4,
      caption: "The moment the sun touched the Pacific at Big Sur cliff.",
      description: "We had been driving for 7 hours, windows down, salty air filling the cabin.",
      is_favorite: true,
      created_at: new Date(Date.now() - 864e5 * 45).toISOString()
    };
    const mem2 = {
      id: "mem_02",
      capsule_id: cap1Unlocked.id,
      uploaded_by: demoUser.id,
      uploader_name: demoUser.full_name,
      file_name: "Redwood_Canopy_Walk.jpg",
      file_type: "image",
      mime_type: "image/jpeg",
      storage_path: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80",
      file_size: 31e5,
      caption: "Walking amongst giants older than civilization itself.",
      description: "Felt tiny and at peace.",
      is_favorite: true,
      created_at: new Date(Date.now() - 864e5 * 44).toISOString()
    };
    const mem3 = {
      id: "mem_03",
      capsule_id: cap1Unlocked.id,
      uploaded_by: demoUser.id,
      uploader_name: demoUser.full_name,
      file_name: "Campfire_Acoustic_Jam.mp3",
      file_type: "audio",
      mime_type: "audio/mpeg",
      storage_path: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      file_size: 42e5,
      caption: "Acoustic jam by the fire under Orion constellation.",
      description: "Recorded directly on phone microphone.",
      is_favorite: false,
      created_at: new Date(Date.now() - 864e5 * 43).toISOString()
    };
    const mem4 = {
      id: "mem_04",
      capsule_id: cap2Soon.id,
      uploaded_by: demoUser.id,
      uploader_name: demoUser.full_name,
      file_name: "Desk_Setup_At_Midnight.jpg",
      file_type: "image",
      mime_type: "image/jpeg",
      storage_path: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      file_size: 198e4,
      caption: "Where all the midnight coding and dreaming happened.",
      description: "Coffee mug stained with dark roast, screen glowing violet.",
      created_at: new Date(Date.now() - 864e5 * 10).toISOString()
    };
    this.data.memories.push(mem1, mem2, mem3, mem4);
    const letter1 = {
      id: "let_01",
      capsule_id: cap1Unlocked.id,
      author_id: demoUser.id,
      author_name: demoUser.full_name,
      title: "To the travelers we are becoming",
      content: `Dear Future Self,

If you are reading this, time has slipped past like sand through cupped hands. 
Remember the salt spray in Monterey? Remember how we promised we wouldn't settle into comfortable numbness?

Right now, as I write this, you were terrified of taking risks, yet you packed two bags and drove into the unknown. I hope you still look up at the stars with that exact reverence. I hope you haven't forgotten how laughter sounds when your ribs ache.

Keep building. Keep trusting. Keep wandering.

With unconditional love,
Your 2024 Self`,
      prompt_used: "What do you hope your future self remembers?",
      created_at: new Date(Date.now() - 864e5 * 45).toISOString(),
      updated_at: new Date(Date.now() - 864e5 * 45).toISOString()
    };
    const letter2 = {
      id: "let_02",
      capsule_id: cap2Soon.id,
      author_id: demoUser.id,
      author_name: demoUser.full_name,
      title: "Unlocking the 30s: No Regrets",
      content: `Hello Alex!
Today you turn a new chapter. We worried so much about having everything figured out. Did we solve the puzzle? Probably not, and that is okay. Celebrate this day with people who genuinely care about your peace of mind.`,
      prompt_used: "What are your biggest dreams?",
      created_at: new Date(Date.now() - 864e5 * 10).toISOString(),
      updated_at: new Date(Date.now() - 864e5 * 10).toISOString()
    };
    this.data.letters.push(letter1, letter2);
    this.data.capsule_members.push({
      id: "mem_rel_01",
      capsule_id: cap3Shared.id,
      user_id: contributorUser.id,
      role: "contributor",
      user_email: contributorUser.email,
      user_name: contributorUser.full_name,
      user_avatar: contributorUser.avatar_url,
      joined_at: new Date(Date.now() - 864e5 * 4).toISOString()
    });
    this.data.comments.push({
      id: "comm_01",
      capsule_id: cap1Unlocked.id,
      user_id: contributorUser.id,
      username: contributorUser.username,
      user_avatar: contributorUser.avatar_url,
      content: "This feels like a cinematic movie! That Big Sur sunset is breathtaking.",
      created_at: new Date(Date.now() - 864e5 * 2).toISOString()
    });
    this.data.likes.push(
      { id: "like_01", capsule_id: cap1Unlocked.id, user_id: contributorUser.id, created_at: (/* @__PURE__ */ new Date()).toISOString() },
      { id: "like_02", capsule_id: cap1Unlocked.id, user_id: adminUser.id, created_at: (/* @__PURE__ */ new Date()).toISOString() }
    );
    this.data.notifications.push(
      {
        id: "notif_01",
        user_id: demoUser.id,
        type: "capsule_unlocked",
        title: "Capsule Unlocked!",
        message: 'Your capsule "Our Pacific Coast Odyssey 2024" has reached its destination in time.',
        capsule_id: cap1Unlocked.id,
        is_read: false,
        created_at: new Date(Date.now() - 864e5 * 3).toISOString()
      },
      {
        id: "notif_02",
        user_id: demoUser.id,
        type: "capsule_sealed",
        title: "Capsule Sealed in Stasis",
        message: 'Your capsule "Letter to My 30th Birthday Self" is sealed and safely locked.',
        capsule_id: cap2Soon.id,
        is_read: true,
        created_at: new Date(Date.now() - 864e5 * 10).toISOString()
      }
    );
    this.data.activity_logs.push(
      {
        id: "act_01",
        user_id: demoUser.id,
        username: demoUser.username,
        action: "CAPSULE_UNLOCKED",
        details: 'Capsule "Our Pacific Coast Odyssey 2024" was automatically unlocked by the scheduler.',
        timestamp: new Date(Date.now() - 864e5 * 3).toISOString()
      },
      {
        id: "act_02",
        user_id: demoUser.id,
        username: demoUser.username,
        action: "CAPSULE_SEALED",
        details: 'Capsule "Letter to My 30th Birthday Self" was sealed until unlock date.',
        timestamp: new Date(Date.now() - 864e5 * 10).toISOString()
      }
    );
    this.data.notification_preferences.push({
      user_id: demoUser.id,
      remind_7_days: true,
      remind_1_day: true,
      remind_on_unlock: true,
      email_notifications: true
    });
    this.save();
    console.log("Seeded initial Time Capsule database successfully.");
  }
}
const db = new DatabaseManager();
export {
  db
};
