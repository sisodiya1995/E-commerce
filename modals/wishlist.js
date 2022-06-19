var mongoose = require('mongoose');
var schema = mongoose.Schema;
var slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

var wishSchema = new schema({
    title : {type : String , required : true} ,
    quantity : {type : Number , default : 1},
    likes : {type : Number } ,
    price :{type : Number , required : true},
    userID :{type : schema.Types.ObjectId , ref : "User"},
    slug: { type: String, slug: "title" },
    image :{type : String}
},{timestamps : true})

var WishList = mongoose.model('WishList' , wishSchema)
module.exports = WishList;
