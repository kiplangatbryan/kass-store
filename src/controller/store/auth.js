const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const router = require("express").Router();

const User = require("../../models/users");

exports.postLogin = async (req, res, next) => {
  const { email, passwd } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      req.flash("error", "The Email is not Registered");
      return res.redirect("/login");
    }

    const isEqual = await bcrypt.compare(passwd, user.pascode);

    if (!isEqual) {
      req.flash("error", "password mismatch");
      return res.redirect("/login");
    }

    req.session.user = user;
    req.session.isAuth = true;
    req.session.save((err) => console.log(err));

    return res.status(200).redirect("/");
  } catch (err) {
    const Err = new Error(err);
    Err.statusCode = 500;
    next(Err);
  }
};

exports.postSign = async (req, res, next) => {
  const { email, passwd, title } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      req.flash("error", "Account already Exists");
      return res.redirect("/register");
    }

    const hashedCode = await bcrypt.hash(passwd, 10);

    const userDoc = new User({
      email,
      title,
      pascode: hashedCode,
      admin: false,
    });
    await userDoc.save();

    req.session.user = userDoc;
    req.session.isAuth = true;
    req.session.save((err) => console.log(err));

    return res.redirect("/");
  } catch (err) {
    const Err = new Error(err);
    Err.statusCode = 500;
    next(Err);
  }
};

exports.postReset = async (req, res, next) => {
  const { email } = req.body;
  let token;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.status(500).redirect("/");
    }
    token = buffer.toString("hex");
  });

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      req.flash("resetError", "No user with that email Found!");
      return res.redirect("/resetPass");
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;

    await user.save();

    return res.redirect("/");

    // console.log('The Mail should be arriving soon')
    // await mailAgent.sendMail({
    //         to: email,
    //         from: 'info.bryan-cook@gmail.com',
    //         subject: 'Password Reset',
    //         html: `
    //         <h3>Hey, </3>
    //         <p>Did you request for a password reset</p>
    //         <p>Note: The token provided will expire after one hour?, click on the <br>
    //         </p>
    //             <a href="http://localhost:2000/reset/${token}"> link below to proceed </a>
    //     `
    //     })

    //         return res.redirect('/')
  } catch (err) {
    const Err = new Error(err);
    Err.statusCode = 500;
    next(Err);
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "kassCart | login",
    isAuthentificated: req.session.isAuth,
    errorMsg: req.flash("resetError"),
    Role: "Login",
  });
};

exports.getSignIn = (req, res) => {
  res.render("auth/sign", {
    path: "/register",
    pageTitle: "kassCart | Sign",
    isAuthentificated: req.session.isAuth,
    errorMsg: req.flash("resetError"),
    Role: "Register",
  });
};

exports.getReset = (req, res) => {
  res.render("auth/reset", {
    path: "/",
    pageTitle: "Reset Passcode",
    errorMsg: req.flash("resetError"),
    isAuthentificated: req.session.isAuth,
    Role: "Reset",
  });
};

exports.validateToken = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) return res.redirect("/");
    return res.render("new-pascode", {
      path: "/",
      pageTitle: "Password Reset",
      token: token.toString(),
      errorMsg: req.flash("tokenErr"),
    });
  } catch (err) {
    const Err = new Error(err);
    Err.statusCode = 500;
    next(Err);
  }
};

exports.postPasswdUpdate = async (req, res, next) => {
  console.log("Then What the fuck ");
  const { oldpass, passwd } = req.body;

  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.redirect("/login");
    }
    const isSame = await bcrypt.compare(oldpass, user.pascode);

    if (!isSame) {
      req.flash("passErr", "Incorrect password");
      return res.redirect("/account");
    }
    const updatedPass = await bcrypt.hash(passwd, 12);
    user.pascode = updatedPass;

    await user.save();

    req.flash("success", "Password Update Successfull");
    return res.redirect("/account");
  } catch (err) {
    const Err = new Error(err);
    Err.statusCode = 500;
    next(Err);
  }
};

exports.resetPasswdAfter = async (req, res, next) => {
  const token = req.body.token;
  const password = req.body.passwd;

  try {
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      req.flash("tokenError", "Your Token Has Already Expired");
      return res.redirect("/reset/:token");
    }
    const hashedPasswd = await bcrypt.hash(password, 12);

    user.pascode = hashedPasswd;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    return res.redirect("/");
  } catch (err) {
    const Err = new Error(err);
    Err.statusCode = 500;
    next(Err);
  }
};

exports.Logout = (req, res, next) => {
  req.session.destroy((err) => {
    const Err = new Error(err);
    Err.statusCode = 500;
    next(Err);
  });
  console.log("---session Destroyed---");
  res.redirect("/");
};

module.exports = router;
