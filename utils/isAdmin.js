module.exports = function (req, res, next) {
   if (req.session.isAdmin) {
      return next()
   }
   res.redirect("admin/access")
}
