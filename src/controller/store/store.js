const router = require("express").Router();

const Products = require("../../models/products");
const User = require("../../models/users");

exports.index = async (req, res) => {
  let user = "";
  if (req.session.isAuth) {
    user = req.session.user;
  }

  let page = req.query.page || 1;

  const { products, paginationData, groups } =
    await fetchProductsAndTheirGroupsAndPaginationDataForPage(page);

  return res.render("store/index", {
    path: "/",
    pageTitle: "Home | kassCart",
    isAuthentificated: req.session.isAuth,
    user: user,
    products,
    Category: groups,
    paginationData,
  });
};

exports.getStore = async (req, res) => {
  let user = "";
  if (req.session.isAuth) {
    user = req.session.user;
  }

  let page = +req.query.page || 1;

  const { products, paginationData, groups } =
    await fetchProductsAndTheirGroupsAndPaginationDataForPage(page);
  return res.render("store/shop", {
    path: "/",
    pageTitle: "Home | kassCart",
    isAuthentificated: req.session.isAuth,
    user: user,
    products,
    category: groups,
    paginationData,
  });
};

async function fetchProductsAndTheirGroupsAndPaginationDataForPage(page) {
  const ITEMS_PAR_PAGE = 6;
  const TOTAL_PRODUCTS = await Products.find().countDocuments();
  const products = await Products.find()
    .skip((page - 1) * ITEMS_PAR_PAGE)
    .limit(ITEMS_PAR_PAGE);

  let groups = [];

  for (let i = 0; i < products.length; i++) {
    let index = groups.findIndex((gr) => {
      return gr.Category === products[i].Category;
    });
    if (index < 0) {
      let size = 1;
      let temp = {
        Category: products[i].Category,
        size: size,
      };
      groups.push(temp);
    } else {
      groups[index].size += 1;
    }
  }

  let updateProds = products.map((arr) => {
    let dateCon = new Date(arr.createdAt).valueOf();
    const current = new Date().valueOf();

    let rem = current - dateCon;
    const created = Math.floor(rem / 1000 / 60 / 60 / 24);

    return {
      _id: arr._id,
      title: arr.title,
      price: Number(arr.price)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,"),
      description: arr.description,
      Category: arr.Category,
      stock: arr.stock,
      imgUrl: arr.imgUrl,
      creation: created,
    };
  });
  updateProds = updateProds.reverse();

  // console.log(updateProds)

  const paginationData = {
    hasPreviousPage: page > 1,
    hasNextPage: page * ITEMS_PAR_PAGE < TOTAL_PRODUCTS,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(TOTAL_PRODUCTS / ITEMS_PAR_PAGE),
    currentPage: page,
  };

  return {
    products: updateProds,
    groups,
    paginationData,
  };
}

exports.getCart = async (req, res) => {
  let user = "";
  if (req.session.isAuth) {
    user = req.session.user;
  }

  const userDoc = await req.user.populate("cart.Items.product").execPopulate();

  let Items = userDoc.cart.Items;

  console.log(Items);

  let Total = 0;

  Items.forEach((i) => {
    Total += parseInt(i.product.price);
  });

  return res.render("store/cart", {
    path: "/cart",
    pageTitle: "KassCart - cart",
    isAuthentificated: req.session.isAuth,
    user: user,
    cart: Items,
    totals: Total,
  });
};

exports.EditCart = async (req, res) => {
  const prodId = req.params.prodId;

  try {
    const product = await Products.findOne({ _id: prodId });
    console.log(product);
    await req.user.deleteItem(product);

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.singleProduct = (req, res) => {
  let proId = req.params.prodId;
  console.log(proId);
  Products.findOne({ _id: proId })
    .then((single) => {
      return res.render("store/product-single.ejs", {
        single,
        pageTite: single.title,
      });
    })
    .catch((err) => console.log(err));
};

exports.findProduct = async (req, res) => {
  const category = req.query.category;

  const query = req.query.query;

  console.log(req.query);
  if (category) {
    const products = await Products.find({ Category: category });
    return res.status(200).json({
      data: products,
    });
  }
};

exports.getCheckout = (req, res) => {
  return res.render("store/checkout", {
    path: "/address",
    pageTitle: "Dashboard | kassCart",
  });
};

exports.postCustomerInfo = async (req, res) => {
  const { code, phone, country, city } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ _id: req.user._id });

    if (!user) return res.redirect("/login");

    user.address = {
      country,
      city,
      phone,
      code,
    };
    await user.save();
    req.flash("success", "Address Info update successfull");
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = (req, res) => {
  let user = "";
  if (req.session.isAuth) {
    user = req.session.user;
  }
  return res.render("dash/orders", {
    path: "/orders",
    pageTitle: "Dashboard | kassCart",
    isAuthentificated: req.session.isAuth,
    user: user,
  });
};

exports.getAddress = (req, res) => {
  let user = "";
  if (req.session.isAuth) {
    user = req.session.user;
  }
  return res.render("dash/address", {
    path: "/address",
    pageTitle: "Dashboard | kassCart",
    isAuthentificated: req.session.isAuth,
    user: user,
  });
};

exports.getDashboard = (req, res) => {
  let flashErr = req.flash("passErr"),
    flashSuccess = req.flash("success"),
    Err = "",
    success = "";

  if (!flashErr.length == 0) {
    Err = flashErr[0];
  } else if (!flashSuccess.length == 0) {
    success = flashSuccess[0];
  }

  let user = "";
  if (req.session.isAuth) {
    user = req.session.user;
  }
  return res.render("dash/account", {
    path: "/account",
    pageTitle: "Dashboard | kassCart",
    isAuthentificated: req.session.isAuth,
    user: user,
    errors: Err,
    success: success,
  });
};
