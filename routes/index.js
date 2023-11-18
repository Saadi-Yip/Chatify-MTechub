const express = require("express");
const router = express.Router();
const middleware = require("./middleware/index.js");
const controllers = require("./controllers/index.js");

router.post("/signup", controllers.signup);
router.post("/login", controllers.login);
router.post(
  "/upload",
  middleware.upload.single("image"),
  controllers.uploadImage
);
router.get("/users", middleware.authenticateUser, controllers.getUsers);
router.get(
  "/messages/:userId",
  middleware.authenticateUser,
  controllers.userMessages
);
router.get(
  "/messages",
  middleware.authenticateUser,
  controllers.getAllMessages
);

module.exports = router;
