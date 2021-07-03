const router  = require('express').Router()

const userAuth = require('./auth') 
const store = require('./store') 


router.use(userAuth)
router.use(store)

module.exports = router