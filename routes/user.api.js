const express = require("express");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

// 회원가입
router.post("/", userController.createUser);
// valid한 토큰인지 확인 -> 토큰으로 유저를 찾아 리턴
router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;