const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");
const {
  authenticateToken,
  checkPermission,
} = require("../middlewares/authenticateToken");

router.post("/api/send-register", userController.register);
router.post("/api/send-login", userController.login);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile-pictures");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadProfilePic = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Only images are allowed");
    }
  },
});

router.post(
  "/api/upload-profile-picture",
  authenticateToken,
  uploadProfilePic.single("profilePicture"),
  userController.uploadProfilePic
);
router.get("/api/profile", authenticateToken, userController.getUserData);
router.post("/api/update-name", authenticateToken, userController.changeName);
router.post(
  "/api/update-password",
  authenticateToken,
  userController.changePassword
);
router.get(
  "/api/users",
  authenticateToken,
  checkPermission("manage_users"),
  userController.getUser
);
router.post(
  "/api/users/:id",
  authenticateToken,
  checkPermission("manage_users"),
  userController.changeUserData
);
router.delete(
  "/api/users/:id",
  authenticateToken,
  checkPermission("manage_users"),
  userController.deleteUser
);

module.exports = router;
