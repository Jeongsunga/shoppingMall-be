const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
const Product = require("./Product");

const reviewSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required: true },
    content: { type: String, required: true },
    rate: { type: Number, required: true },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    item: {
      productId: { type: mongoose.ObjectId, ref: Product, required: true },
      size: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
