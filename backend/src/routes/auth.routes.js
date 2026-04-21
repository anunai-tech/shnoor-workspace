const router = require("express").Router();
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    hd: "shnoor.com",
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL,
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);


router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error on logout:", destroyErr);
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
});

// Returns the authenticated user from the session. Called on every app load
// by AuthContext to check if the user is still logged in.
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    const { id, name, email, avatar_url, role, is_active } = req.user;
    return res.json({ id, name, email, avatar_url, role, is_active });
  }
  return res.status(401).json({ message: "Not authenticated" });
});

module.exports = router;