const router = require("express").Router()
const multer = require("multer")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const Product = require("../../models/products")
const Users = require("../../models/users")
const Secure = require("../../../utils/security/isAdmin")

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "./uploads")
   },
   filename: (req, file, cb) => {
      cb(
         null,
         crypto.randomBytes(32).toString("hex") +
            "." +
            file.mimetype.split("/")[1]
      )
   },
})
const fileFilter = (req, file, cb) => {
   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      return cb(null, true)
   }
   cb(false)
}
const uploads = multer({
   storage: storage,
   limits: {
      fileSize: 1024 * 1024 * 10,
   },
   fileFilter: fileFilter,
})

router.get("/dashboard", Secure, (req, res) => {
   const { email } = req.session.user
   res.render("admin/index", {
      path: "/admin/dashboard",
      pageTitle: "Admin | kassCart | Dashboard",
      user: email,
   })
})
router.get("/dashboard", Secure, (req, res) => {
   const { email } = req.session.user
   res.render("admin/users", {
      path: "/admin/dashboard",
      pageTitle: "Admin | kassCart | Dashboard",
      user: email,
   })
})

router.post("/add-user", Secure, async (req, res, next) => {
   const { mail, passwd, uname } = req.body

   try {
      const userDoc = await Users.findOne({ email: mail })
      if (userDoc) {
         return res.redirect("/admin/users?error=alreadyExists")
      }

      const Hashedpasswd = await bcrypt.hash(passwd, 10)

      const user = new Users({
         title: uname,
         email: mail,
         pascode: Hashedpasswd,
         admin: false,
      })

      await user.save()
      res.redirect("/admin/users")
   } catch (err) {
      const Err = new Error(err)
      Err.statusCode = 500
      next(Err)
   }
})

router.get("/users", Secure, async (req, res, next) => {
   const user = req.session.user.email

   try {
      const data = await Users.find()
      const users = data.map((user) => {
         return {
            email: user.email,
            uid: user._id,
            lastlg: user.updatedAt,
            created: user.createdAt,
         }
      })
      res.render("admin/users", {
         path: "/admin/users",
         pageTitle: "Admin | kassCart | Dashboard",
         user: user,
         users,
      })
   } catch (err) {
      const Err = new Error(err)
      Err.statusCode = 500
      next(Err)
   }
})

router.get("/add-product", Secure, (req, res) => {
   const user = req.session.user.email
   res.render("admin/add-product", {
      path: "/admin/dashboard",
      pageTitle: "Admin | kassCart | Dashboard",
      user: user,
   })
})

router.post(
   "/add-product",
   Secure,
   uploads.single("image"),
   async (req, res, next) => {
      const { title, price, description, Category, stock } = req.body
      const imgUrl = req.file.filename
      const product = new Product({
         title,
         price,
         description,
         Category,
         imgUrl,
         stock,
      })

      try {
         await product.save()

         return res.status(201).redirect("/admin/dashboard")
      } catch (err) {
         const Err = new Error(err)
         Err.statusCode = 500
         next(Err)
      }
   }
)

module.exports = router
