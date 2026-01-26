import User from "../data/user.js";

const MAX_PASS_DURATION = 15 * 60 * 1000; // 15 minutes

setInterval(async () => {
  try {
    // 1. Get all users with an active pass
    const users = await User.find({
      "pass.status": "active",
      "pass.start": { $ne: null },
    });

    for (const user of users) {
      const pass = user.pass;
      if (!pass) continue;

      const elapsed = Date.now() - pass.start;

      // 2. If pass has exceeded max duration, expire it
      if (elapsed > MAX_PASS_DURATION) {
        user.pass.status = "expired";
        user.pass.end = Date.now();
        await user.save();
      }
    }
  } catch (err) {
    console.error("Error expiring active passes:", err);
  }
}, 60 * 1000);
