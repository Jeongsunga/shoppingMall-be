const Review = require("../models/Review");
const Order = require("../models/Order");

const reviewController = {};

reviewController.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { content, rate, image, size } = req.body;

    // 구매 여부 확인
    const userOrder = await Order.findOne({
      userId,
      items: {
        $elemMatch: {
          productId: id,
          size: size,
        },
      },
      status: { $in: ["delivered", "refund"] },
    });

    if (!userOrder) throw new Error("구매한 제품만 리뷰 작성 가능합니다.");

    // 이미 작성했던 리뷰인지 확인
    const existingReview = await Review.findOne({
      userId,
      "item.productId": id,
      "item.size": size,
    });
    if (existingReview)
      throw new Error("이미 해당 상품 및 사이즈에 대한 리뷰를 작성했습니다.");

    const review = new Review({
      userId,
      content,
      rate,
      image,
      item: {
        productId: id,
        size,
      },
    });

    await review.save();
    return res.status(200).json({ status: "success", review });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

reviewController.getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({
      "item.productId": id,
      isDeleted: false,
    })
      .populate({
        path: "item.productId",
        model: "Product",
      })

      .populate({
        path: "userId",
        model: "User",
        select: "name",
      });
    return res.status(200).json({ status: "success", data: reviews });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

reviewController.updateReview = async (req, res) => {
  try {
    const { userId } = req;
    const reviewId = req.params.id;
    const { content, rate, image } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) throw new Error("리뷰를 찾을 수 없습니다.");

    if (review.userId.toString() !== userId)
      throw new Error("본인이 작성한 리뷰만 수정 가능합니다.");

    const updatedReview = await Review.findByIdAndUpdate(
      { _id: reviewId },
      { content, rate, image },
      { new: true }
    );

    return res.status(200).json({ status: "success", data: updatedReview });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

reviewController.deleteReview = async (req, res) => {
  try {
    const { userId } = req;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) throw new Error("리뷰를 찾을 수 없습니다.");

    if (review.userId.toString() !== userId)
      throw new Error("본인이 작성한 리뷰만 삭제 가능합니다.");

    review.isDeleted = true;
    await review.save();

    return res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = reviewController;
