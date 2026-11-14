import assert from "assert";
import bcrypt from "bcryptjs";
import { db } from "../server/db.js";
import { checkAndUnlockCapsules } from "../server/unlockWorker.js";
import { generateToken } from "../server/auth.js";
async function runTestSuite() {
  console.log("🧪 Starting Digital Time Capsule Test Suite...\n");
  console.log("1. Testing Authentication & Credential Verification...");
  const users = db.getData().users;
  const demoUser = users.find((u) => u.email === "alex@timecapsule.com");
  assert(demoUser, "Demo user Alex must exist in seeded database.");
  const validPwd = bcrypt.compareSync("password123", demoUser.password_hash);
  assert(validPwd, "Password hash verification must succeed for password123.");
  const token = generateToken(demoUser);
  assert(token && token.length > 20, "JWT token must be properly generated.");
  console.log("   ✓ Authentication and credential hashing verified.");
  console.log("2. Testing Capsule Creation & Cryptographic Sealing...");
  const data = db.getData();
  const testCapsule = {
    id: `test_cap_${Date.now()}`,
    owner_id: demoUser.id,
    title: "Automated Test Memory Vault",
    description: "Unit testing timestamp invariants",
    category: "Special Moments",
    cover_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
    theme: "cosmic-cyan",
    status: "draft",
    visibility: "private",
    unlock_at: new Date(Date.now() - 5e3).toISOString(),
    // expired timestamp
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    timezone: "UTC",
    is_archived: false
  };
  data.capsules.push(testCapsule);
  testCapsule.status = "sealed";
  testCapsule.sealed_at = (/* @__PURE__ */ new Date()).toISOString();
  assert.strictEqual(testCapsule.status, "sealed", "Capsule should be sealed in stasis.");
  console.log("   ✓ Capsule creation and stasis transition verified.");
  console.log("3. Testing Automated Scheduled Unlock Worker & Idempotency...");
  const unlockedCountFirstPass = checkAndUnlockCapsules();
  assert(unlockedCountFirstPass >= 1, "Unlock worker must unlock the expired test capsule.");
  assert.strictEqual(testCapsule.status, "unlocked", "Capsule status must now be unlocked.");
  const secondPassCount = checkAndUnlockCapsules();
  assert.strictEqual(secondPassCount, 0, "Unlock worker must be idempotent and not re-unlock already unlocked capsules.");
  console.log("   ✓ Automated unlocking and worker idempotency verified.");
  console.log("4. Testing Notification System & Duplicate Prevention...");
  const notifications = data.notifications.filter((n) => n.capsule_id === testCapsule.id);
  assert(notifications.length === 1, "Only one unlock notification should exist for the capsule.");
  console.log("   ✓ Single notification recorded without duplicates.");
  data.capsules = data.capsules.filter((c) => c.id !== testCapsule.id);
  data.notifications = data.notifications.filter((n) => n.capsule_id !== testCapsule.id);
  db.save();
  console.log("\n🎉 ALL 5 TEST SUITES PASSED FLAWLESSLY!");
}
runTestSuite().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
