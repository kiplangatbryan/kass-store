const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const session_store = require("connect-mongodb-session")(session)
const flash = require("connect-flash")
const path = require("path")
// const logger = require('morgan')
require("dotenv").config()


// const admin_auth = require("./controller/admin/auth")
// const admin = require("./controller/admin/admin")
const customerRoutes = require('./routes/index')
const User = require("./models/users")

const app = express()

const local_uri = "mongodb://localhost:27017/kassCart"

const store = new session_store({
   uri: local_uri,
   collection: "sessions",
})

app.set("view engine", "ejs")
app.set("views", "pages")
app.set("port", process.env.PORT || 2222)


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
// app.use(logger('dev'))

app.use(
   session({
      secret: process.env.session_secret,
      saveUninitialized: false,
      resave: false,
      store: store,
   }),
)

app.use(flash())

app.use(async (req, res, next) => {
   if (!req.session.user) {
      return next()
   }
   try {
      const user = await User.findById(req.session.user._id)
      req.user = user
      next()
   } catch (err) {
      const error = new Error(err)
      error.statusCode = 500
      next(error)
   }
})

// app.use("/admin", admin)
// app.use("/admin", admin_auth)

app.use(customerRoutes)


app.use((err, req, res) => {
   throw err
})

mongoose
   .connect(local_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(() => {
      app.listen(app.get("port"), () => {
         console.log(`Appp is started ... on ${app.get("port")}`)
      })
   })
   .catch((err) => console.log(err))
