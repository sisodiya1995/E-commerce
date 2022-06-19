var mongoose = require("mongoose");
var schema = mongoose.Schema;
var slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

var productSchema = new schema(
  {
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    price: { type: Number, required: true },
    slug: { type: String, slug: "title" },
    image: { type: String },
  },
  { timestamps: true }
);

var Product = mongoose.model("Product", productSchema);
module.exports = Product;
