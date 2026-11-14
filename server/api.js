import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db.js";
import { requireAuth, optionalAuth, requireAdmin, generateToken } from "./auth.js";
const router = Router();
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "mem_" + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  // 50MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(jpg|jpeg|png|webp|gif|mp4|mov|webm|mp3|wav|ogg|pdf|txt|doc|docx)$/i;
    if (allowedExtensions.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Supported: JPG, PNG, WEBP, MP4, MOV, MP3, WAV, PDF, TXT."));
    }
  }
});
function logActivity(userId, username, action, details) {
  db.getData().activity_logs.unshift({
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    user_id: userId,
    username: username || "User",
    action,
    details,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  db.save();
}
router.post("/auth/register", (req, res) => {
  const { email, password, username, full_name, timezone } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: "Email, password, and username are required." });
  }
  const data = db.getData();
  const existingUser = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }
  const existingUsername = data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (existingUsername) {
    return res.status(400).json({ error: "Username is already taken. Please choose another." });
  }
  const password_hash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    email: email.toLowerCase(),
    username: username.trim(),
    full_name: full_name?.trim() || username.trim(),
    avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
    bio: "Preserving timeless memories.",
    role: email.includes("admin") ? "admin" : "user",
    timezone: timezone || "UTC",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    password_hash
  };
  data.users.push(newUser);
  data.notification_preferences.push({
    user_id: newUser.id,
    remind_7_days: true,
    remind_1_day: true,
    remind_on_unlock: true,
    email_notifications: true
  });
  data.notifications.push({
    id: `notif_${Date.now()}_welcome`,
    user_id: newUser.id,
    type: "system",
    title: "Welcome to Digital Time Capsule!",
    message: "Start by creating your first capsule, upload memories, and seal your time-travel vault.",
    is_read: false,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  logActivity(newUser.id, newUser.username, "USER_REGISTERED", `User registered account ${newUser.email}`);
  db.save();
  const { password_hash: _, ...safeUser } = newUser;
  const token = generateToken(safeUser);
  return res.status(201).json({ user: safeUser, token });
});
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = db.getData().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (user.is_suspended) {
    return res.status(403).json({ error: "Account suspended. Contact support." });
  }
  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const { password_hash, ...safeUser } = user;
  const token = generateToken(safeUser);
  return res.json({ user: safeUser, token });
});
router.post("/auth/google", (req, res) => {
  const { email, name, avatar } = req.body;
  const targetEmail = (email || "google_traveler@timecapsule.com").toLowerCase();
  const data = db.getData();
  let user = data.users.find((u) => u.email === targetEmail);
  if (!user) {
    const password_hash2 = bcrypt.hashSync("google-oauth-" + Math.random(), 10);
    const username = (name ? name.toLowerCase().replace(/\s+/g, "_") : "time_explorer") + "_" + Math.floor(Math.random() * 100);
    user = {
      id: `usr_g_${Date.now()}`,
      email: targetEmail,
      username,
      full_name: name || "Google Explorer",
      avatar_url: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetEmail}`,
      bio: "Traversing the temporal stream with Google Auth.",
      role: "user",
      timezone: "America/New_York",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      password_hash: password_hash2
    };
    data.users.push(user);
    db.save();
  }
  if (user.is_suspended) {
    return res.status(403).json({ error: "Account suspended." });
  }
  const { password_hash, ...safeUser } = user;
  const token = generateToken(safeUser);
  return res.json({ user: safeUser, token });
});
router.get("/auth/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});
router.put("/auth/profile", requireAuth, (req, res) => {
  const { full_name, bio, avatar_url, timezone } = req.body;
  const data = db.getData();
  const user = data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  if (full_name !== void 0) user.full_name = full_name;
  if (bio !== void 0) user.bio = bio;
  if (avatar_url !== void 0) user.avatar_url = avatar_url;
  if (timezone !== void 0) user.timezone = timezone;
  db.save();
  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser });
});
router.put("/auth/password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  const data = db.getData();
  const user = data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(400).json({ error: "Current password does not match." });
  }
  user.password_hash = bcrypt.hashSync(newPassword, 10);
  db.save();
  return res.json({ message: "Password updated successfully." });
});
router.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  return res.json({
    message: `If an account exists for ${email}, a secure password reset link has been dispatched via email.`
  });
});
router.get("/auth/demo-accounts", (req, res) => {
  return res.json({
    accounts: [
      { email: "alex@timecapsule.com", role: "user", label: "Demo User (Alex Vance)" },
      { email: "admin@timecapsule.com", role: "admin", label: "Admin (Platform Overseer)" },
      { email: "elena@timecapsule.com", role: "contributor", label: "Contributor (Elena)" }
    ]
  });
});
router.get("/capsules", requireAuth, (req, res) => {
  const { status, category, search, sort } = req.query;
  const data = db.getData();
  const userId = req.user.id;
  const memberCapsuleIds = new Set(
    data.capsule_members.filter((m) => m.user_id === userId).map((m) => m.capsule_id)
  );
  let list = data.capsules.filter((c) => c.owner_id === userId || memberCapsuleIds.has(c.id));
  if (status && status !== "all") {
    list = list.filter((c) => c.status === status);
  }
  if (category && category !== "all") {
    list = list.filter((c) => c.category === category);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  const enriched = list.map((c) => {
    const memCount = data.memories.filter((m) => m.capsule_id === c.id).length;
    const likesCount = data.likes.filter((l) => l.capsule_id === c.id).length;
    const isLiked = data.likes.some((l) => l.capsule_id === c.id && l.user_id === userId);
    return {
      ...c,
      memory_count: memCount,
      likes_count: likesCount,
      is_liked: isLiked
    };
  });
  if (sort === "oldest") {
    enriched.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sort === "unlock_soon") {
    enriched.sort((a, b) => new Date(a.unlock_at).getTime() - new Date(b.unlock_at).getTime());
  } else {
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  return res.json({ capsules: enriched });
});
router.get("/capsules/:id", optionalAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) {
    return res.status(404).json({ error: "Capsule not found." });
  }
  const userId = req.user?.id;
  const isOwner = userId === capsule.owner_id;
  const isMember = userId && data.capsule_members.some((m) => m.capsule_id === id && m.user_id === userId);
  const isAdmin = req.user?.role === "admin";
  const isUnlocked = capsule.status === "unlocked";
  const isPublicUnlocked = capsule.visibility === "public" && isUnlocked;
  if (!isOwner && !isMember && !isAdmin && !isPublicUnlocked) {
    return res.status(403).json({
      error: "This capsule is sealed or private. Access is restricted to authorized keepers."
    });
  }
  const memCount = data.memories.filter((m) => m.capsule_id === capsule.id).length;
  const members = data.capsule_members.filter((m) => m.capsule_id === capsule.id);
  const likesCount = data.likes.filter((l) => l.capsule_id === capsule.id).length;
  const commentsCount = data.comments.filter((c) => c.capsule_id === capsule.id).length;
  const isLiked = userId ? data.likes.some((l) => l.capsule_id === capsule.id && l.user_id === userId) : false;
  const isBookmarked = userId ? data.bookmarks.some((b) => b.capsule_id === capsule.id && b.user_id === userId) : false;
  return res.json({
    capsule: {
      ...capsule,
      memory_count: memCount,
      likes_count: likesCount,
      comments_count: commentsCount,
      is_liked: isLiked,
      is_bookmarked: isBookmarked
    },
    members,
    isOwner,
    isMember
  });
});
router.post("/capsules", requireAuth, (req, res) => {
  const { title, description, category, cover_image, theme, visibility, unlock_at, status } = req.body;
  if (!title || !unlock_at) {
    return res.status(400).json({ error: "Title and unlock date are required." });
  }
  const unlockDate = new Date(unlock_at);
  if (isNaN(unlockDate.getTime())) {
    return res.status(400).json({ error: "Invalid unlock date provided." });
  }
  const user = req.user;
  const newCapsule = {
    id: `cap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    owner_id: user.id,
    owner_name: user.full_name,
    owner_avatar: user.avatar_url,
    title: title.trim(),
    description: description?.trim() || "",
    category: category || "Personal",
    cover_image: cover_image || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    theme: theme || "cosmic-cyan",
    status: status === "sealed" ? "sealed" : "draft",
    visibility: visibility || "private",
    unlock_at: unlockDate.toISOString(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    sealed_at: status === "sealed" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
    timezone: user.timezone || "UTC",
    is_archived: false
  };
  const data = db.getData();
  data.capsules.unshift(newCapsule);
  logActivity(
    user.id,
    user.username,
    newCapsule.status === "sealed" ? "CAPSULE_SEALED" : "CAPSULE_CREATED",
    `Created capsule "${newCapsule.title}" (Status: ${newCapsule.status})`
  );
  db.save();
  return res.status(201).json({ capsule: newCapsule });
});
router.put("/capsules/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  if (capsule.owner_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Only the capsule owner can modify settings." });
  }
  if (capsule.status === "sealed" && req.body.status !== "sealed") {
    return res.status(400).json({ error: "Sealed capsules cannot be reverted to draft." });
  }
  const { title, description, category, cover_image, theme, visibility, unlock_at } = req.body;
  if (title) capsule.title = title.trim();
  if (description !== void 0) capsule.description = description.trim();
  if (category) capsule.category = category;
  if (cover_image) capsule.cover_image = cover_image;
  if (theme) capsule.theme = theme;
  if (visibility) capsule.visibility = visibility;
  if (unlock_at) {
    const d = new Date(unlock_at);
    if (!isNaN(d.getTime())) {
      capsule.unlock_at = d.toISOString();
    }
  }
  db.save();
  return res.json({ capsule });
});
router.post("/capsules/:id/seal", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  if (capsule.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Only the owner can seal this capsule." });
  }
  if (capsule.status === "sealed") {
    return res.status(400).json({ error: "Capsule is already sealed in stasis." });
  }
  if (capsule.status === "unlocked") {
    return res.status(400).json({ error: "Capsule has already unlocked." });
  }
  const unlockTime = new Date(capsule.unlock_at).getTime();
  if (isNaN(unlockTime) || unlockTime <= Date.now()) {
    return res.status(400).json({
      error: "Capsule unlock date must be set in the future before sealing."
    });
  }
  capsule.status = "sealed";
  capsule.sealed_at = (/* @__PURE__ */ new Date()).toISOString();
  data.notifications.unshift({
    id: `notif_${Date.now()}_sealed`,
    user_id: req.user.id,
    type: "capsule_sealed",
    title: "Capsule Sealed into the Future",
    message: `"${capsule.title}" has been sealed. Stored memories will remain encrypted until ${new Date(capsule.unlock_at).toLocaleDateString()}.`,
    capsule_id: capsule.id,
    is_read: false,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  logActivity(req.user.id, req.user.username, "CAPSULE_SEALED", `Sealed capsule "${capsule.title}"`);
  db.save();
  return res.json({ capsule, message: "Capsule sealed successfully into stasis." });
});
router.post("/capsules/:id/force-unlock", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  if (capsule.owner_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized." });
  }
  capsule.status = "unlocked";
  capsule.unlocked_at = (/* @__PURE__ */ new Date()).toISOString();
  data.notifications.unshift({
    id: `notif_${Date.now()}_forced`,
    user_id: req.user.id,
    type: "capsule_unlocked",
    title: "Time Portal Opened!",
    message: `Capsule "${capsule.title}" has been unlocked. Ready for discovery!`,
    capsule_id: capsule.id,
    is_read: false,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  logActivity(req.user.id, req.user.username, "MANUAL_UNLOCK_TEST", `Fast-unlocked capsule "${capsule.title}"`);
  db.save();
  return res.json({ capsule, message: "Capsule has been unlocked!" });
});
router.post("/capsules/:id/reschedule", requireAuth, (req, res) => {
  const { id } = req.params;
  const { new_unlock_at } = req.body;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  if (capsule.owner_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized." });
  }
  const d = new Date(new_unlock_at);
  if (isNaN(d.getTime()) || d.getTime() <= Date.now()) {
    return res.status(400).json({ error: "New unlock date must be in the future." });
  }
  const oldDate = capsule.unlock_at;
  capsule.unlock_at = d.toISOString();
  if (capsule.status === "unlocked") {
    capsule.status = "sealed";
  }
  logActivity(
    req.user.id,
    req.user.username,
    "CAPSULE_RESCHEDULED",
    `Rescheduled "${capsule.title}" from ${oldDate} to ${capsule.unlock_at}`
  );
  db.save();
  return res.json({ capsule, message: "Capsule rescheduled successfully." });
});
router.post("/capsules/:id/archive", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  if (capsule.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized." });
  }
  capsule.is_archived = !capsule.is_archived;
  db.save();
  return res.json({ capsule, message: capsule.is_archived ? "Capsule archived." : "Capsule restored." });
});
router.delete("/capsules/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.capsules.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: "Capsule not found." });
  const capsule = data.capsules[index];
  if (capsule.owner_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized." });
  }
  data.capsules.splice(index, 1);
  data.memories = data.memories.filter((m) => m.capsule_id !== id);
  data.letters = data.letters.filter((l) => l.capsule_id !== id);
  data.capsule_members = data.capsule_members.filter((m) => m.capsule_id !== id);
  data.comments = data.comments.filter((c) => c.capsule_id !== id);
  data.likes = data.likes.filter((l) => l.capsule_id !== id);
  data.bookmarks = data.bookmarks.filter((b) => b.capsule_id !== id);
  logActivity(req.user.id, req.user.username, "CAPSULE_DELETED", `Deleted capsule "${capsule.title}"`);
  db.save();
  return res.json({ message: "Capsule deleted permanently." });
});
router.get("/capsules/:id/opening", optionalAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  const userId = req.user?.id;
  const isOwner = userId === capsule.owner_id;
  const isMember = userId && data.capsule_members.some((m) => m.capsule_id === id && m.user_id === userId);
  const isAdmin = req.user?.role === "admin";
  const now = Date.now();
  const unlockTime = new Date(capsule.unlock_at).getTime();
  if (capsule.status === "sealed" || unlockTime > now) {
    return res.status(403).json({
      error: "Temporal Stasis Active. This capsule is sealed and cannot be opened before its scheduled unlock timestamp.",
      is_sealed: true,
      unlock_at: capsule.unlock_at,
      capsule: {
        id: capsule.id,
        title: capsule.title,
        description: capsule.description,
        category: capsule.category,
        cover_image: capsule.cover_image,
        theme: capsule.theme,
        status: capsule.status,
        visibility: capsule.visibility,
        unlock_at: capsule.unlock_at,
        sealed_at: capsule.sealed_at,
        owner_name: capsule.owner_name,
        memory_count: data.memories.filter((m) => m.capsule_id === id).length
      }
    });
  }
  const isPublicUnlocked = capsule.visibility === "public" && capsule.status === "unlocked";
  if (!isOwner && !isMember && !isAdmin && !isPublicUnlocked) {
    return res.status(403).json({ error: "Capsule is private. Access is restricted to authorized keepers." });
  }
  const memories = data.memories.filter((m) => m.capsule_id === id);
  const letters = data.letters.filter((l) => l.capsule_id === id);
  const comments = data.comments.filter((c) => c.capsule_id === id);
  const members = data.capsule_members.filter((m) => m.capsule_id === id);
  return res.json({
    capsule,
    memories,
    letters,
    comments,
    members,
    is_sealed: false
  });
});
router.get("/capsules/:id/memories", optionalAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  const userId = req.user?.id;
  const isOwner = userId === capsule.owner_id;
  const isMember = userId && data.capsule_members.some((m) => m.capsule_id === id && m.user_id === userId);
  const isAdmin = req.user?.role === "admin";
  const now = Date.now();
  const unlockTime = new Date(capsule.unlock_at).getTime();
  if (capsule.status === "sealed" && unlockTime > now) {
    const memoryCount = data.memories.filter((m) => m.capsule_id === id).length;
    return res.status(403).json({
      error: "Memories are cryptographically sealed in stasis.",
      is_sealed: true,
      unlock_at: capsule.unlock_at,
      count: memoryCount,
      memories: []
    });
  }
  const isPublicUnlocked = capsule.visibility === "public" && capsule.status === "unlocked";
  if (!isOwner && !isMember && !isAdmin && !isPublicUnlocked) {
    return res.status(403).json({ error: "Access restricted." });
  }
  const memories = data.memories.filter((m) => m.capsule_id === id);
  return res.json({ memories, is_sealed: false });
});
router.post("/capsules/:id/memories", requireAuth, upload.single("file"), (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  const userId = req.user.id;
  const isOwner = userId === capsule.owner_id;
  const member = data.capsule_members.find((m) => m.capsule_id === id && m.user_id === userId);
  const canUpload = isOwner || member && member.role === "contributor";
  if (!canUpload) {
    return res.status(403).json({ error: "You do not have contributor permissions to add memories." });
  }
  if (capsule.status === "sealed" && !isOwner) {
    return res.status(400).json({ error: "Capsule is sealed. No new contributions can be added." });
  }
  let fileName = "";
  let storagePath = "";
  let fileSize = 0;
  let mimeType = "application/octet-stream";
  let fileType = "other";
  if (req.file) {
    fileName = req.file.originalname;
    storagePath = `/uploads/${req.file.filename}`;
    fileSize = req.file.size;
    mimeType = req.file.mimetype;
  } else if (req.body.external_url) {
    fileName = req.body.file_name || "Preserved_Memory.jpg";
    storagePath = req.body.external_url;
    fileSize = req.body.file_size || 1024 * 500;
    mimeType = req.body.mime_type || "image/jpeg";
  } else {
    return res.status(400).json({ error: "No file or media URL uploaded." });
  }
  if (mimeType.startsWith("image/")) fileType = "image";
  else if (mimeType.startsWith("video/")) fileType = "video";
  else if (mimeType.startsWith("audio/")) fileType = "audio";
  else if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("document")) fileType = "document";
  const newMemory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    capsule_id: id,
    uploaded_by: req.user.id,
    uploader_name: req.user.full_name,
    file_name: fileName,
    file_type: fileType,
    mime_type: mimeType,
    storage_path: storagePath,
    file_size: fileSize,
    caption: req.body.caption || "",
    description: req.body.description || "",
    is_favorite: false,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  data.memories.push(newMemory);
  db.save();
  return res.status(201).json({ memory: newMemory });
});
router.delete("/memories/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.memories.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ error: "Memory not found." });
  const memory = data.memories[index];
  const capsule = data.capsules.find((c) => c.id === memory.capsule_id);
  if (memory.uploaded_by !== req.user.id && capsule?.owner_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized to delete this memory." });
  }
  data.memories.splice(index, 1);
  db.save();
  return res.json({ message: "Memory removed." });
});
router.patch("/memories/:id/favorite", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const memory = data.memories.find((m) => m.id === id);
  if (!memory) return res.status(404).json({ error: "Memory not found." });
  memory.is_favorite = !memory.is_favorite;
  db.save();
  return res.json({ memory });
});
router.get("/memories/gallery", requireAuth, (req, res) => {
  const { type, search, favoriteOnly } = req.query;
  const data = db.getData();
  const userId = req.user.id;
  const now = Date.now();
  const accessibleCapsuleIds = new Set(
    data.capsules.filter((c) => c.status === "unlocked" || c.owner_id === userId && c.status === "draft").map((c) => c.id)
  );
  const sealedCapsuleIds = new Set(
    data.capsules.filter((c) => c.status === "sealed" && new Date(c.unlock_at).getTime() > now).map((c) => c.id)
  );
  let memories = data.memories.filter((m) => accessibleCapsuleIds.has(m.capsule_id) && !sealedCapsuleIds.has(m.capsule_id));
  if (type && type !== "all") {
    memories = memories.filter((m) => m.file_type === type);
  }
  if (favoriteOnly === "true") {
    memories = memories.filter((m) => m.is_favorite);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    memories = memories.filter(
      (m) => m.file_name.toLowerCase().includes(q) || m.caption && m.caption.toLowerCase().includes(q)
    );
  }
  return res.json({ memories });
});
router.get("/capsules/:id/letter", optionalAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  const userId = req.user?.id;
  const isOwner = userId === capsule.owner_id;
  const isAdmin = req.user?.role === "admin";
  const now = Date.now();
  const unlockTime = new Date(capsule.unlock_at).getTime();
  if (capsule.status === "sealed" && unlockTime > now) {
    return res.status(403).json({
      error: "Letters are cryptographically sealed in stasis until the unlock date arrives.",
      is_sealed: true,
      unlock_at: capsule.unlock_at,
      letters: []
    });
  }
  const isUnlocked = capsule.status === "unlocked";
  const isPublicUnlocked = capsule.visibility === "public" && isUnlocked;
  if (!isOwner && !isAdmin && !isPublicUnlocked) {
    return res.status(403).json({ error: "Letters are private." });
  }
  const letters = data.letters.filter((l) => l.capsule_id === id);
  return res.json({ letters, is_sealed: false });
});
router.post("/capsules/:id/letter", requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, content, prompt_used } = req.body;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  if (capsule.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Only the capsule owner can write letters." });
  }
  if (capsule.status === "sealed") {
    return res.status(400).json({ error: "Capsule is sealed. Letters cannot be altered." });
  }
  let letter = data.letters.find((l) => l.capsule_id === id && l.author_id === req.user.id);
  if (letter) {
    letter.title = title || letter.title;
    letter.content = content || letter.content;
    letter.prompt_used = prompt_used || letter.prompt_used;
    letter.updated_at = (/* @__PURE__ */ new Date()).toISOString();
  } else {
    letter = {
      id: `let_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      capsule_id: id,
      author_id: req.user.id,
      author_name: req.user.full_name,
      title: title || "Letter to My Future Self",
      content: content || "",
      prompt_used: prompt_used || "",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.letters.push(letter);
  }
  db.save();
  return res.status(201).json({ letter });
});
router.post("/capsules/:id/invite", requireAuth, (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  if (capsule.owner_id !== req.user.id) {
    return res.status(403).json({ error: "Only the capsule keeper can invite contributors." });
  }
  const token = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const invitation = {
    id: `inv_id_${Date.now()}`,
    capsule_id: id,
    capsule_title: capsule.title,
    inviter_id: req.user.id,
    inviter_name: req.user.full_name,
    invitee_email: email ? email.toLowerCase() : "invite_link@timecapsule.com",
    role: role || "contributor",
    token,
    status: "pending",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    expires_at: new Date(Date.now() + 7 * 864e5).toISOString()
  };
  data.capsule_invitations.push(invitation);
  if (email) {
    const targetUser = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      data.notifications.unshift({
        id: `notif_${Date.now()}_inv`,
        user_id: targetUser.id,
        type: "invitation_received",
        title: "Capsule Invitation Received",
        message: `${req.user.full_name} invited you to contribute to "${capsule.title}".`,
        capsule_id: capsule.id,
        is_read: false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  db.save();
  return res.status(201).json({ invitation, invite_url: `/join/${token}` });
});
router.get("/invitations/verify/:token", (req, res) => {
  const { token } = req.params;
  const data = db.getData();
  const invitation = data.capsule_invitations.find((i) => i.token === token);
  if (!invitation) return res.status(404).json({ error: "Invitation not found or expired." });
  const capsule = data.capsules.find((c) => c.id === invitation.capsule_id);
  return res.json({ invitation, capsule });
});
router.post("/invitations/:token/accept", requireAuth, (req, res) => {
  const { token } = req.params;
  const data = db.getData();
  const invitation = data.capsule_invitations.find((i) => i.token === token);
  if (!invitation) return res.status(404).json({ error: "Invitation invalid or expired." });
  if (invitation.status !== "pending") {
    return res.status(400).json({ error: `Invitation already ${invitation.status}.` });
  }
  const userId = req.user.id;
  const exists = data.capsule_members.some((m) => m.capsule_id === invitation.capsule_id && m.user_id === userId);
  if (!exists) {
    data.capsule_members.push({
      id: `mem_rel_${Date.now()}`,
      capsule_id: invitation.capsule_id,
      user_id: userId,
      role: invitation.role,
      user_email: req.user.email,
      user_name: req.user.full_name,
      user_avatar: req.user.avatar_url,
      joined_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  invitation.status = "accepted";
  db.save();
  return res.json({ message: "Invitation accepted! You are now a contributor.", capsule_id: invitation.capsule_id });
});
router.get("/capsules-shared", requireAuth, (req, res) => {
  const data = db.getData();
  const userId = req.user.id;
  const memberships = data.capsule_members.filter((m) => m.user_id === userId);
  const capsuleIds = memberships.map((m) => m.capsule_id);
  const sharedCapsules = data.capsules.filter((c) => capsuleIds.includes(c.id)).map((c) => {
    const mem = memberships.find((m) => m.capsule_id === c.id);
    return {
      ...c,
      member_role: mem?.role || "contributor",
      memory_count: data.memories.filter((m) => m.capsule_id === c.id).length
    };
  });
  const pendingInvitations = data.capsule_invitations.filter(
    (i) => i.invitee_email.toLowerCase() === req.user.email.toLowerCase() && i.status === "pending"
  );
  return res.json({ sharedCapsules, pendingInvitations });
});
router.get("/explore", optionalAuth, (req, res) => {
  const { category, search, filter } = req.query;
  const data = db.getData();
  const userId = req.user?.id;
  let list = data.capsules.filter((c) => c.visibility === "public" && c.status === "unlocked" && !c.is_archived);
  if (category && category !== "all") {
    list = list.filter((c) => c.category === category);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  const enriched = list.map((c) => {
    const likesCount = data.likes.filter((l) => l.capsule_id === c.id).length;
    const commentsCount = data.comments.filter((comm) => comm.capsule_id === c.id).length;
    const memoryCount = data.memories.filter((m) => m.capsule_id === c.id).length;
    const isLiked = userId ? data.likes.some((l) => l.capsule_id === c.id && l.user_id === userId) : false;
    const isBookmarked = userId ? data.bookmarks.some((b) => b.capsule_id === c.id && b.user_id === userId) : false;
    return {
      ...c,
      likes_count: likesCount,
      comments_count: commentsCount,
      memory_count: memoryCount,
      is_liked: isLiked,
      is_bookmarked: isBookmarked
    };
  });
  if (filter === "trending" || filter === "popular") {
    enriched.sort((a, b) => (b.likes_count || 0) + (b.comments_count || 0) - ((a.likes_count || 0) + (a.comments_count || 0)));
  } else {
    enriched.sort((a, b) => new Date(b.unlocked_at || b.unlock_at).getTime() - new Date(a.unlocked_at || a.unlock_at).getTime());
  }
  return res.json({ capsules: enriched });
});
router.post("/capsules/:id/like", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const userId = req.user.id;
  const existingIndex = data.likes.findIndex((l) => l.capsule_id === id && l.user_id === userId);
  let isLiked = false;
  if (existingIndex > -1) {
    data.likes.splice(existingIndex, 1);
    isLiked = false;
  } else {
    data.likes.push({
      id: `like_${Date.now()}`,
      capsule_id: id,
      user_id: userId,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    isLiked = true;
  }
  const totalLikes = data.likes.filter((l) => l.capsule_id === id).length;
  db.save();
  return res.json({ is_liked: isLiked, likes_count: totalLikes });
});
router.post("/capsules/:id/bookmark", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const userId = req.user.id;
  const existingIndex = data.bookmarks.findIndex((b) => b.capsule_id === id && b.user_id === userId);
  let isBookmarked = false;
  if (existingIndex > -1) {
    data.bookmarks.splice(existingIndex, 1);
    isBookmarked = false;
  } else {
    data.bookmarks.push({
      id: `bm_${Date.now()}`,
      capsule_id: id,
      user_id: userId,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    isBookmarked = true;
  }
  db.save();
  return res.json({ is_bookmarked: isBookmarked });
});
router.get("/capsules/:id/comments", (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const comments = data.comments.filter((c) => c.capsule_id === id);
  return res.json({ comments });
});
router.post("/capsules/:id/comments", requireAuth, (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Comment content cannot be blank." });
  }
  const data = db.getData();
  const newComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    capsule_id: id,
    user_id: req.user.id,
    username: req.user.username,
    user_avatar: req.user.avatar_url,
    content: content.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  data.comments.unshift(newComment);
  db.save();
  return res.status(201).json({ comment: newComment });
});
router.post("/capsules/:id/report", requireAuth, (req, res) => {
  const { id } = req.params;
  const { reason, details } = req.body;
  const data = db.getData();
  const capsule = data.capsules.find((c) => c.id === id);
  if (!capsule) return res.status(404).json({ error: "Capsule not found." });
  const report = {
    id: `rep_${Date.now()}`,
    capsule_id: id,
    capsule_title: capsule.title,
    reported_by: req.user.id,
    reporter_email: req.user.email,
    reason: reason || "Inappropriate Content",
    details: details || "",
    status: "pending",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  data.reports.unshift(report);
  db.save();
  return res.status(201).json({ message: "Thank you. The report has been dispatched to administrators for review." });
});
router.get("/notifications", requireAuth, (req, res) => {
  const data = db.getData();
  const notifications = data.notifications.filter((n) => n.user_id === req.user.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  return res.json({ notifications, unreadCount });
});
router.patch("/notifications/:id/read", requireAuth, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const notif = data.notifications.find((n) => n.id === id && n.user_id === req.user.id);
  if (notif) {
    notif.is_read = true;
    db.save();
  }
  return res.json({ success: true });
});
router.post("/notifications/mark-all-read", requireAuth, (req, res) => {
  const data = db.getData();
  data.notifications.filter((n) => n.user_id === req.user.id).forEach((n) => n.is_read = true);
  db.save();
  return res.json({ success: true });
});
router.get("/dashboard/stats", requireAuth, (req, res) => {
  const data = db.getData();
  const userId = req.user.id;
  const userCapsules = data.capsules.filter((c) => c.owner_id === userId);
  const totalCapsules = userCapsules.length;
  const sealedCapsules = userCapsules.filter((c) => c.status === "sealed").length;
  const unlockedCapsules = userCapsules.filter((c) => c.status === "unlocked").length;
  const userCapsuleIds = userCapsules.map((c) => c.id);
  const userMemories = data.memories.filter((m) => userCapsuleIds.includes(m.capsule_id) || m.uploaded_by === userId);
  const totalMemories = userMemories.length;
  const totalStorageBytes = userMemories.reduce((acc, m) => acc + (m.file_size || 0), 0);
  const now = Date.now();
  const upcomingUnlocks = userCapsules.filter((c) => c.status === "sealed" && new Date(c.unlock_at).getTime() > now).sort((a, b) => new Date(a.unlock_at).getTime() - new Date(b.unlock_at).getTime()).slice(0, 5);
  const recentActivity = data.activity_logs.filter((a) => a.user_id === userId).slice(0, 6);
  return res.json({
    stats: {
      totalCapsules,
      sealedCapsules,
      unlockedCapsules,
      totalMemories,
      totalStorageBytes,
      upcomingUnlocksCount: upcomingUnlocks.length
    },
    upcomingUnlocks,
    recentActivity
  });
});
router.get("/admin/overview", requireAdmin, (req, res) => {
  const data = db.getData();
  const totalUsers = data.users.length;
  const totalCapsules = data.capsules.length;
  const unlockedCapsules = data.capsules.filter((c) => c.status === "unlocked").length;
  const totalStorageBytes = data.memories.reduce((sum, m) => sum + (m.file_size || 0), 0);
  const pendingReports = data.reports.filter((r) => r.status === "pending").length;
  return res.json({
    stats: {
      totalUsers,
      totalCapsules,
      unlockedCapsules,
      totalStorageBytes,
      pendingReports,
      activityLogsCount: data.activity_logs.length
    },
    recentLogs: data.activity_logs.slice(0, 15)
  });
});
router.get("/admin/users", requireAdmin, (req, res) => {
  const data = db.getData();
  const safeUsers = data.users.map(({ password_hash, ...u }) => ({
    ...u,
    capsule_count: data.capsules.filter((c) => c.owner_id === u.id).length
  }));
  return res.json({ users: safeUsers });
});
router.patch("/admin/users/:id/suspend", requireAdmin, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const user = data.users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found." });
  if (user.role === "admin") return res.status(400).json({ error: "Admin accounts cannot be suspended." });
  user.is_suspended = !user.is_suspended;
  db.save();
  return res.json({ message: user.is_suspended ? "User suspended." : "User restored.", is_suspended: user.is_suspended });
});
router.get("/admin/capsules", requireAdmin, (req, res) => {
  const data = db.getData();
  return res.json({ capsules: data.capsules });
});
router.get("/admin/reports", requireAdmin, (req, res) => {
  const data = db.getData();
  return res.json({ reports: data.reports });
});
router.patch("/admin/reports/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = db.getData();
  const report = data.reports.find((r) => r.id === id);
  if (!report) return res.status(404).json({ error: "Report not found." });
  report.status = status || "resolved";
  db.save();
  return res.json({ report });
});
router.get("/admin/logs", requireAdmin, (req, res) => {
  const data = db.getData();
  return res.json({ logs: data.activity_logs });
});
var stdin_default = router;
export {
  stdin_default as default
};
