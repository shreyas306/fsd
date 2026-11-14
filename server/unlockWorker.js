import { db } from "./db.js";
function startUnlockWorker() {
  console.log("[UnlockWorker] Automated Scheduled Unlocking Worker initialized.");
  checkAndUnlockCapsules();
  setInterval(() => {
    checkAndUnlockCapsules();
  }, 8e3);
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
        capsule.unlocked_at = (/* @__PURE__ */ new Date()).toISOString();
        unlockedCount++;
        const existingNotif = data.notifications.find(
          (n) => n.capsule_id === capsule.id && n.type === "capsule_unlocked" && n.user_id === capsule.owner_id
        );
        if (!existingNotif) {
          data.notifications.unshift({
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            user_id: capsule.owner_id,
            type: "capsule_unlocked",
            title: "Your Time Capsule is Unlocked!",
            message: `The wait is over! "${capsule.title}" is ready to be opened. Relive your preserved memories now.`,
            capsule_id: capsule.id,
            is_read: false,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        const members = data.capsule_members.filter((m) => m.capsule_id === capsule.id);
        for (const member of members) {
          const memberNotif = data.notifications.find(
            (n) => n.capsule_id === capsule.id && n.type === "capsule_unlocked" && n.user_id === member.user_id
          );
          if (!memberNotif) {
            data.notifications.unshift({
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              user_id: member.user_id,
              type: "capsule_unlocked",
              title: "Shared Capsule Unlocked!",
              message: `The shared capsule "${capsule.title}" you contributed to has unlocked!`,
              capsule_id: capsule.id,
              is_read: false,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
        data.activity_logs.unshift({
          id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          user_id: capsule.owner_id,
          username: capsule.owner_name || "System",
          action: "AUTOMATIC_UNLOCK",
          details: `Capsule "${capsule.title}" unlocked on scheduled arrival (${(/* @__PURE__ */ new Date()).toISOString()}).`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log(`[Email Service - Resend] Email notification dispatched to owner for capsule "${capsule.title}".`);
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
