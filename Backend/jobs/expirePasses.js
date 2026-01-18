import users from "../models/users.js";

const MAX_PASS_DURATION = 15 * 60 * 1000; // 15 minutes

setInterval(() => {
  users.forEach((user) => {
    const pass = user.pass;

    if (pass && pass.status === "active" && pass.start) {
      const elapsed = Date.now() - pass.start;

      if (elapsed > MAX_PASS_DURATION) {
        pass.status = "expired";
        pass.end = Date.now();
      }
    }
  });
}, 60 * 1000); // runs every minute
