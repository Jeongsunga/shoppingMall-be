const orderController = {};
const PAGE_SIZE = 3;
const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    // 재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems
        .map((item) => item.message)
        .join(", ");
      throw new Error(errorMessage);
    }

    await productController.updateItemListStock(orderList);

    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    
    return res
      .status(200)
      .json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrders = async (req, res) => {
  try {
    const { page, orderNum } = req.query;
    let response = { status: "success" };
    const cond = orderNum
      ? { orderNum: { $regex: orderNum, $options: "i" } }
      : {};
    let query = Order.find(cond)
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
        },
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name email",
      });

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      // 페이지 수 = 데이터 수 / PAGE_SIZE
      const totalItemNum = await Order.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const orderList = await query.exec();
    response.data = orderList;
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrderByUserId = async (req, res) => {
  try {
    const { userId } = req;
    const order = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    return res.status(200).json({ status: "success", data: order });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrderStatus = async(req, res) => {
  try {
    const orderNum = req.params.id;
    const {status} = req.body;

    const order = await Order.findOneAndUpdate(
      { orderNum },
      { status },
      { new: true }
    );

    if (!order) throw new Error("Order doesn't exist");
    return res.status(200).json({ status: "success", data: order });
  } catch(error) {
    return res.status(400).json({ status: "fail", error: error.message })
  }
};

module.exports = orderController;
