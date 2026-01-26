import User from "../data/user.js";

const MAX_EXPIRED_PASS_DURATION = 5 * 60 * 1000; // 5 minutes

setInterval(async () => {
  try {
    // 1. Get all users who currently have a pass
    const users = await User.find({ pass: { $ne: null } });

    for (const user of users) {
      const pass = user.pass;
      if (!pass) continue;

      const inactive =
        pass.status === "expired" ||
        pass.status === "cancelled" ||
        (pass.status === "ended" && pass.end);

      if (!inactive) continue;

      const referenceTime = pass.end || pass.start;

      if (Date.now() - referenceTime > MAX_EXPIRED_PASS_DURATION) {
        user.pass = null;
        user.markModified("pass");
        await user.save();
      }
    }
  } catch (err) {
    console.error("Error cleaning expired passes:", err);
  }
}, 60 * 1000);
