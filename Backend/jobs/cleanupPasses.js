import users from "../models/users.js";

const MAX_EXPIRED_PASS_DURATION = 5 * 60 * 1000; // 5 minutes

setInterval(() => {
  users.forEach((user) => {
    const pass = user.pass;
    if (!pass) return;

    const inactive =
      pass.status === "expired" ||
      pass.status === "cancelled" ||
      (pass.status === "ended" && pass.end);

    if (!inactive) return;

    const referenceTime = pass.end || pass.start;

    if (Date.now() - referenceTime > MAX_EXPIRED_PASS_DURATION) {
      user.pass = null;
    }
  });
}, 60 * 1000); // runs every minute
