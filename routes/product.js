var express = require("express");
var router = express.Router();
var User = require("../modals/user");
var Products = require("../modals/product");
var WishList = require("../modals/wishlist");
var Cart = require("../modals/cart");
var auth = require("../middlewares/auth");
var multer = require("multer");
var path = require("path");

var uploadpath = path.join(__dirname, "../public/uploads/");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadpath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// add product by
router.get("/new", (req, res, next) => {
  //console.log(req.session.userID)
  var userID = req.session.userID;
  User.findById(userID, (err, user) => {
    if (user.isAdmin === true) {
      return res.render("addProduct");
    } else {
      return res.redirect("/product");
    }
  });
});

router.post("/", upload.single("image"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  req.body.image = req.file.filename;
  Products.create(req.body, (err, product) => {
    console.log(err, product);

    res.redirect("/product/new");
  });
});

// all product

router.get("/", (req, res) => {
  var userID = req.session.userID;
  //var user =req.user;
  //console.log(user ,"user")
  //var googleUserID = req.session.passport.user;
  //console.log(googleUserID ,"googleUser")
  var isAdmin = false;
  var isRegister = true;

  // if no user
  if (!userID) {
    isAdmin = false;
    isRegister = false;
  }

  // if user is register
  if (isRegister === true) {
    User.findById(userID, (err, user) => {
      console.log(user.isAdmin, "admin login");
      if (user.isAdmin === true) {
        isAdmin = true;
      }
    });
  }

  Products.find({}, (err, products) => {
    res.render("products", { products, isAdmin, isRegister });

    //console.log(err ,products)
  });
});

// edit by admin

router.get("/:id/edit", auth.isAdmin, (req, res) => {
  var id = req.params.id;
  Products.findById(id, (err, product) => {
    res.render("editProduct", { product: product });
  });
});

router.post("/:id/edit", (req, res) => {
  var id = req.params.id;
  Products.findByIdAndUpdate(id, req.body, (err, updateProduct) => {
    console.log(updateProduct, "update product");
    res.redirect("/product");
  });
});

// deldte by admin

router.get("/:id/delete", auth.isAdmin, (req, res) => {
  var id = req.params.id;
  Products.findByIdAndDelete(id, (err, delProduct) => {
    console.log(err, delProduct);
    res.redirect("/product");
  });
});

// likes by user

router.get("/:id/likes", auth.isUser, (req, res) => {
  var id = req.params.id;
  Products.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, uplikes) => {
    console.log(uplikes, "update likes");
    res.redirect("/product");
  });
});

// deslike by user

router.get("/:id/dislikes", auth.isUser, (req, res) => {
  var id = req.params.id;
  Products.findById(id, (err, uplikes) => {
    if (uplikes.likes > 0) {
      Product.findByIdAndUpdate(
        id,
        { $inc: { likes: -1 } },
        (err, updateProduct) => {
          console.log(uplikes, "down likes");
          res.redirect("/product");
        }
      );
    } else {
      res.redirect("/product");
    }
  });
});

router.get("/:id/wishlist", auth.isUser, (req, res) => {
  var id = req.params.id;
  var userID = req.session.userID;

  Products.findById(id, (err, pro) => {
    var wishObj = {};
    wishObj.title = pro.title;
    //wishObj.quantity =pro.quantity;
    wishObj.likes = pro.likes;
    wishObj.price = pro.price;
    wishObj.userID = userID;
    wishObj.image = pro.image;
    console.log(pro, "wish list");
    WishList.findOne({ title: pro.title }, (err, p) => {
      if (!p) {
        WishList.create(wishObj, (err, wishListp) => {
          console.log(wishListp, "wish");
          res.redirect("/product");
        });
      }
      if (p) {
        WishList.findOneAndUpdate(
          { title: pro.title },
          { $inc: { quantity: 1 } },
          (err, up) => {
            console.log(err, up);
            res.redirect("/product");
          }
        );
      }
    });
  });
});

// User wishList

router.get("/userWishList", auth.isUser, (req, res) => {
  var userID = req.session.userID;

  WishList.find({ userID: userID }, (err, product) => {
    res.render("wishList", { product: product });
  });
});

// remove from wishlist

router.get("/:id/del", (req, res) => {
  var id = req.params.id;
  WishList.findByIdAndDelete(id, (err, delp) => {
    console.log(err, delp);
    res.redirect("/product/userWishList");
  });
});

router.get("/:id/addCart", auth.isUser, (req, res) => {
  var id = req.params.id;
  var userID = req.session.userID;

  // product list to cart list route
  Products.findById(id, (err, pro) => {
    var cart = {};
    cart.title = pro.title;
    //cart.quantity =pro.quantity;
    cart.likes = pro.likes;
    cart.price = pro.price;
    cart.userID = userID;
    cart.image = pro.image;
    console.log(pro, "cart list list");

    Cart.findOne({ title: pro.title }, (err, p) => {
      if (!p) {
        Cart.create(cart, (err, wishListp) => {
          Products.findByIdAndUpdate(
            id,
            { $inc: { quantity: -1 } },
            (err, updateqty) => {
              console.log(updateqty);
            }
          );
          //console.log(wishListp ,"wish")
          res.redirect("/product");
        });
      }
      if (p) {
        Cart.findOneAndUpdate(
          { title: pro.title },
          { $inc: { quantity: 1 } },
          (err, up) => {
            Products.findByIdAndUpdate(
              id,
              { $inc: { quantity: -1 } },
              (err, updateqty) => {
                //console.log(updateqty)
              }
            );
            console.log(err, up);
            res.redirect("/product");
          }
        );
      }
    });
  });
});
// wishlist to cart route

router.get("/:id/wishtocart", auth.isUser, (req, res) => {
  var userID = req.session.userID;
  var wishlistId = req.params.id;

  // wish list to cart list
  WishList.findById(wishlistId, (err, pro) => {
    var cart = {};
    cart.title = pro.title;
    cart.quantity = pro.quantity;
    cart.likes = pro.likes;
    cart.price = pro.price;
    cart.userID = userID;
    cart.image = pro.image;
    console.log(pro, "cart list list");

    Cart.findOne({ title: pro.title }, (err, p) => {
      if (!p) {
        Cart.create(cart, (err, wishListp) => {
          res.redirect("/product");
        });
      }
      if (p) {
        Cart.findOneAndUpdate(
          { title: pro.title },
          { $inc: { quantity: 1 } },
          (err, up) => {
            res.redirect("/product");
          }
        );
      }
    });
  });
});

// cartlist route
router.get("/cartList", (req, res) => {
  var userID = req.session.userID;
  Cart.find({ userID: userID }, (err, product) => {
    //let fitlerP = product.filter((p,i) => p.title);
    // console.log(fitlerP ,"filter")
    var total = product.reduce((acc, cv) => {
      acc = acc + cv.quantity * cv.price;
      return acc;
    }, 0);
    console.log(total, "cart price");
    res.render("cart", { product, total });
  });
});

// remove product fron the cart list
router.get("/:id/remove", (req, res) => {
  var id = req.params.id;
  Cart.findByIdAndDelete(id, (err, delp) => {
    console.log(err, delp);
    res.redirect("/product/cartList");
  });
});

router.get("/:id/qtyinc", (req, res) => {
  var id = req.params.id;
  Cart.findByIdAndUpdate(id, { $inc: { quantity: 1 } }, (err, delp) => {
    console.log(err, delp);
    res.redirect("/product/cartList");
  });
});

router.get("/:id/qtydec", (req, res) => {
  var id = req.params.id;
  Cart.findByIdAndUpdate(id, { $inc: { quantity: -1 } }, (err, delp) => {
    console.log(err, delp);
    res.redirect("/product/cartList");
  });
});

module.exports = router;
