var mongoose = require("mongoose");
var schema = mongoose.Schema;
var slug = require("mongoose-slug-generator");
mongoose.plugin(slug);
var Cart = require("../modals/cart");

var cartSchema = new schema(
  {
    title: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    likes: { type: Number },
    price: { type: Number, required: true },
    userID: { type: schema.Types.ObjectId, ref: "User" },
    slug: { type: String, slug: "title" },
    image: { type: String },
  },
  { timestamps: true }
);

var Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
