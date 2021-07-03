const bcrypt = require("bcryptjs")
const router = require("express").Router()

const User = require("../../models/users")

router.get("/access", (req, res) => {
   res.render("admin/auth", {
      pageTitle: "Admin | kassCart | login",
      errorMsg: req.flash("error"),
      Role: "Admin Access",
   })
})

router.post("/login", async (req, res, next) => {
   const { email, passwd } = req.body
   console.log(req.body)

   try {
      const user = await User.findOne({ email: email })

      if (!user) {
         req.flash("error", "The Email is not Registered")
         return res.redirect("/admin/access?error=emptyFields")
      }
      // if (!user.admin) {
      //    req.flash("error", "Insufficient user permissions")
      //    return res.redirect("/admin/access?error=emptyFields")
      // }
      const isEqual = await bcrypt.compare(passwd, user.pascode)

      if (!isEqual) {
         req.flash("error", "password mismatch")
         return res.redirect("/admin/access")
      }

      req.session.user = user
      req.session.isAdmin = true
      req.session.save((err) => console.log(err))

      return res.status(200).redirect("/admin/dashboard")
   } catch (err) {
      const Err = new Error(err)
      Err.statusCode = 500
      next(Err)
   }
})

router.get("/logout", (req, res) => {
   req.session.destroy((err) => {
      console.log(err)
   })
   res.redirect("/admin/access")
})

module.exports = router
