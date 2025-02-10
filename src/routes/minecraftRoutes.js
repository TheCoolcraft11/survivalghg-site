const express = require("express");
const router = express.Router();
const minecraftController = require("../controllers/minecraftController");
const {
  authenticateToken,
  checkPermission,
} = require("../middlewares/authenticateToken");

router.post(
  "/api/mc/start",
  /* authenticateToken, checkPermission('start_server'), */ minecraftController.startMcServer
);
router.get(
  "/api/mc/start",
  /* authenticateToken, checkPermission('start_server'), */ minecraftController.startMcServer
);
router.post(
  "/api/mc/stop",
  authenticateToken,
  checkPermission("stop_server"),
  minecraftController.stopMcServer
);
router.post(
  "/api/mc/restart",
  authenticateToken,
  checkPermission("restart_server"),
  minecraftController.restartMcServer
);
router.post(
  "/api/mc/kill",
  authenticateToken,
  checkPermission("kill_server"),
  minecraftController.killMcServer
);
router.post(
  "/api/mc/send",
  authenticateToken,
  checkPermission("send_command"),
  minecraftController.sendMcCommand
);
router.get(
  "/api/backups",
  authenticateToken,
  checkPermission("view_backups", minecraftController.getBackups)
);
router.get("/api/backups/status", minecraftController.getBackupStatus);
router.get(
  "/api/backup/download/:filename",
  authenticateToken,
  checkPermission("download_backups", minecraftController.downloadBackup)
);
router.delete(
  "/api/backups/:filename",
  authenticateToken,
  checkPermission("delete_backups", minecraftController.deleteBackup)
);

router.get('/api/query', minecraftController.getServerQuery);

module.exports = router;
