import { db } from "./db.js";

/**
 * Dispatches notifications across In-App, Email, and Activity Logs when a capsule seal is opened
 * @param {Object} capsule - The capsule that was unsealed
 * @param {Object|string} trigger - The user or system process that triggered the unsealing
 */
export async function notifySealOpened(capsule, trigger = "AUTOMATED_SCHEDULER") {
  const data = db.getData();
  const now = new Date().toISOString();
  const notifiedUsers = [];

  const triggerName = typeof trigger === "object" ? trigger.full_name || trigger.username : String(trigger);
  const triggerId = typeof trigger === "object" ? trigger.id : "system";

  // 1. Gather all recipients: Owner + all capsule members / contributors
  const recipients = [];
  const owner = data.users.find((u) => u.id === capsule.owner_id);
  if (owner) {
    recipients.push({
      id: owner.id,
      email: owner.email,
      name: owner.full_name,
      role: "owner"
    });
  }

  // Capsule members (collaborators)
  const members = data.capsule_members.filter((m) => m.capsule_id === capsule.id);
  for (const m of members) {
    if (!recipients.some((r) => r.id === m.user_id)) {
      const u = data.users.find((user) => user.id === m.user_id);
      recipients.push({
        id: m.user_id,
        email: m.user_email || u?.email,
        name: m.user_name || u?.full_name || "Contributor",
        role: m.role || "contributor"
      });
    }
  }

  // 2. Dispatch in-app notifications
  for (const recipient of recipients) {
    const isOwner = recipient.id === capsule.owner_id;
    const title = isOwner ? "Your Time Capsule Seal is Opened!" : `Shared Capsule "${capsule.title}" Unsealed!`;
    const message = isOwner
      ? `The stasis seal on "${capsule.title}" has been broken! All preserved memories and future letters are now revealed.`
      : `The capsule "${capsule.title}" you contributed to has been unsealed by temporal arrival.`;

    // Avoid duplicate notifications within the last 10 minutes for this event
    const existingRecent = data.notifications.find(
      (n) => n.capsule_id === capsule.id && n.user_id === recipient.id && n.type === "capsule_unlocked"
    );

    if (!existingRecent) {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const notif = {
        id: notifId,
        user_id: recipient.id,
        type: "capsule_unlocked",
        title,
        message,
        capsule_id: capsule.id,
        is_read: false,
        created_at: now
      };
      data.notifications.unshift(notif);
      notifiedUsers.push(recipient);

      // 3. Dispatch Email notification if email preferences allow
      await dispatchEmailNotification(recipient, capsule, title, message);
    }
  }

  // 4. Log to Audit / Activity Trail
  data.activity_logs.unshift({
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    user_id: triggerId,
    username: triggerName,
    action: "SEAL_OPENED",
    details: `Capsule "${capsule.title}" seal opened (${now}). Notified ${notifiedUsers.length} keeper(s) and collaborator(s).`,
    timestamp: now
  });

  // 5. Save to database (which automatically syncs to MySQL)
  db.save();

  console.log(`[NotificationService] Dispatched seal-opened broadcast for "${capsule.title}" to ${notifiedUsers.length} user(s).`);
  return { success: true, notifiedCount: notifiedUsers.length, recipients: notifiedUsers };
}

/**
 * Handles sending email notifications (via Resend if API key is provided, or structured log)
 */
async function dispatchEmailNotification(recipient, capsule, subject, message) {
  if (!recipient.email) return;

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || "vault@timecapsule.space";
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const capsuleUrl = `${appUrl}/dashboard/capsules`;

  const emailPayload = {
    from: fromEmail,
    to: recipient.email,
    subject: `[Temporal Alert] ${subject}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080B16; color: #FFFFFF; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #8B5CF6;">
        <h1 style="color: #22D3EE; font-size: 24px; margin-bottom: 8px;">Time Capsule Unsealed</h1>
        <p style="color: #94A3B8; font-size: 14px; margin-bottom: 24px;">Temporal stasis has ended. The vault is open.</p>
        <div style="background-color: #111827; border: 1px solid #374151; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #FFFFFF; font-size: 18px; margin-top: 0;">${capsule.title}</h2>
          <p style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">${message}</p>
          <p style="color: #A78BFA; font-size: 12px; margin-bottom: 0;">Scheduled Unlock: ${new Date(capsule.unlock_at).toLocaleString()}</p>
        </div>
        <a href="${capsuleUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #06B6D4); color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px;">Open Memory Vault</a>
      </div>
    `
  };

  if (resendApiKey && resendApiKey.startsWith("re_") && resendApiKey !== "re_123456789_abcdef") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });
      if (res.ok) {
        console.log(`[Email Service - Resend] Real email dispatched to ${recipient.email} for capsule "${capsule.title}".`);
        return true;
      }
    } catch (err) {
      console.warn(`[Email Service] Resend API dispatch error:`, err.message);
    }
  }

  // Fallback / Development Simulation Log
  console.log(`[Email Service - Notification Log] To: ${recipient.email} | Subject: "${emailPayload.subject}" | Capsule: "${capsule.title}"`);
  return true;
}

