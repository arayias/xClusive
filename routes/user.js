const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/signup", userController.user_create_get);

router.get("/login", userController.user_login_get);

router.get("/logout", userController.user_logout_get);

router.post("/signup", userController.user_create_post);

router.post("/login", userController.user_login_post);

module.exports = router;
