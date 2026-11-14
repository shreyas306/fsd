import { db } from "./db.js";
import { notifySealOpened } from "./notificationService.js";

function startUnlockWorker() {
  console.log("[UnlockWorker] Automated Scheduled Unlocking Worker initialized.");
  checkAndUnlockCapsules();
  setInterval(() => {
    checkAndUnlockCapsules();
  }, 8000);
}

function checkAndUnlockCapsules() {
  const data = db.getData();
  const now = Date.now();
  let unlockedCount = 0;
  for (const capsule of data.capsules) {
    if (capsule.status === "sealed") {
      const unlockTime = new Date(capsule.unlock_at).getTime();
      if (!isNaN(unlockTime) && unlockTime <= now) {
        console.log(`[UnlockWorker] Unlocking capsule "${capsule.title}" (ID: ${capsule.id}) - Scheduled time reached: ${capsule.unlock_at}`);
        capsule.status = "unlocked";
        capsule.unlocked_at = new Date().toISOString();
        unlockedCount++;
        notifySealOpened(capsule, "AUTOMATED_SCHEDULER").catch((err) => {
          console.error("[UnlockWorker] Error dispatching seal-opened notification:", err);
        });
      }
    }
  }
  if (unlockedCount > 0) {
    db.save();
  }
  return unlockedCount;
}

export {
  checkAndUnlockCapsules,
  startUnlockWorker
};
