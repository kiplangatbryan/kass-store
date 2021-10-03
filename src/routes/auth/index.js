const router = require("express").Router();
const controller = require("../../controller/store/auth");

const {
  postLogin,
  postSign,
  postReset,
  getLogin,
  getSignIn,
  getReset,
  validateToken,
  postPasswdUpdate,
  resetPasswdAfter,
  Logout,
} = require("../../controller/store/auth");

const blockReauth = require("../../../utils/authprev");
const isAuthenticated = require("../../../utils/protect");

router.post("/auth", postLogin);
router.post("/register", postSign);
router.post("/resetPass", postReset);
router.get("/reset/:token", validateToken);
router.post("/auth/reset", resetPasswdAfter);
router.get("/logout", Logout);

router.get("/login", blockReauth, getLogin);
router.get("/register", blockReauth, getSignIn);
router.get("/resetPass", blockReauth, getReset);
router.post("/updatePass", isAuthenticated, postPasswdUpdate);

module.exports = router;
