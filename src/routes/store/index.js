const router = require("express").Router();

const isAuthenticated = require("../../../utils/protect");

const {
  index,
  getStore,
  getCart,
  EditCart,
  singleProduct,
  findProduct,
  getCheckout,
  getDashboard,
  postCustomerInfo,
  getOrders,
  getAddress,
} = require("../../controller/store/store");

router.get("/", index);
router.get("/store", getStore);
router.get("/store/:prodId", singleProduct);
router.get("/search", findProduct);
router.get("/checkout", getCheckout);

router.get("/cart", isAuthenticated, getCart);
router.get("/cart-remove/:prodId", isAuthenticated, EditCart);
router.get("/dashboard", isAuthenticated, getDashboard);
router.post("/address", isAuthenticated, postCustomerInfo);
router.get("/orders", isAuthenticated, getOrders);
router.get("/address", isAuthenticated, getAddress);

module.exports = router;
