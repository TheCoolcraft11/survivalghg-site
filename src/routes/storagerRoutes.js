const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");
const {
  authenticateToken,
  checkPermission,
} = require("../middlewares/authenticateToken");

router.post(
  "/api/storage/upload",
  authenticateToken,
  checkPermission("upload"),
  storageController.uploadFiles
);
router.get("/api/storage/usage", authenticateToken, storageController.getUsage);
router.get(
  "/api/storage/files",
  authenticateToken,
  checkPermission("read"),
  storageController.getFiles
);
router.get(
  "/api/storage/download/:filename",
  authenticateToken,
  checkPermission("read"),
  storageController.downloadFile
);
router.delete(
  "/api/storage/delete/:filename",
  authenticateToken,
  checkPermission("delete"),
  storageController.deleteFile
);
router.post(
  "/api/storage/share/:filename",
  authenticateToken,
  checkPermission("share"),
  storageController.shareFile
);
router.get(
  "/api/storage/shared/:filename/:token",
  storageController.getSharedFile
);
router.get(
  "/api/storage/share-info/:filename/:token",
  storageController.getSharedInfo
);
router.post(
  "/api/storage/group/:groupName/upload",
  authenticateToken,
  checkPermission("upload"),
  storageController.uploadGroupFiles
);
router.post(
  "/api/groups/create",
  authenticateToken,
  storageController.createGroup
);
router.post(
  "/api/groups/:groupName/addUser",
  authenticateToken,
  storageController.addUserToGroup
);
router.get(
  "/api/groups/:groupName/files",
  authenticateToken,
  storageController.getGroupFiles
);
router.get("/api/groups", authenticateToken, storageController.getAllGroups);
router.get(
  "/api/groups/:groupName/download/:filename",
  authenticateToken,
  storageController.downloadGroupFile
);

module.exports = router;
