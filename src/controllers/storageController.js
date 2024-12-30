const multer = require("multer");
const roles = require("../roles.json").roles;
const { getUserStorageUsage } = require("../utils/storageUtils");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { getUserData } = require("../utils/userUtils");
const BASE_URL = process.env.BASE_URL;

const sharedFilesPath = path.join(__dirname, "../../data/sharedFiles.json");

let sharedFiles = loadSharedFiles();

function saveSharedFiles() {
  try {
    fs.writeFileSync(sharedFilesPath, JSON.stringify(sharedFiles, null, 2));
  } catch (err) {
    console.error("Error saving shared files:", err);
  }
}

function loadSharedFiles() {
  try {
    if (fs.existsSync(sharedFilesPath)) {
      const data = fs.readFileSync(sharedFilesPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading shared files:", err);
  }
  return {};
}

function cleanupExpiredEntries() {
  const now = Date.now();
  let updated = false;

  for (const filename in sharedFiles) {
    sharedFiles[filename] = sharedFiles[filename].filter((entry) => {
      if (entry.expiryTime && now > entry.expiryTime) {
        updated = true;
        return false;
      }
      return true;
    });

    if (sharedFiles[filename].length === 0) {
      delete sharedFiles[filename];
      updated = true;
    }
  }

  if (updated) {
    saveSharedFiles();
  }
}

setInterval(cleanupExpiredEntries, 1000 * 60 * 60);

exports.uploadFiles = (req, res) => {
  const userRole = req.user.role;
  if (!roles[userRole]) {
    return res.status(403).json({ message: "Access denied: Invalid role" });
  }

  const storageLimitMB = roles[userRole].storageLimit;
  const storageLimit = storageLimitMB * 1024 * 1024;

  const storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!req.user || !req.user.id) {
        return cb(new Error("User not authenticated"), null);
      }

      const userUploadPath = path.join("uploads/storage", `${req.user.id}`);

      fs.mkdirSync(userUploadPath, { recursive: true });

      cb(null, userUploadPath);
    },
    filename: (req, file, cb) => {
      const sanitizedFilename = path
        .basename(file.originalname)
        .normalize("NFKD")
        .replace(/[^\w.-]/g, "");
      const uniqueName = `${Date.now()}-${sanitizedFilename}`;
      cb(null, uniqueName);
    },
  });

  const upload = multer({
    storage: storage3,
    fileFilter: async (req, file, cb) => {
      try {
        const userId = req.user.id;
        const currentUsage = await getUserStorageUsage(userId);
        const fileSize = parseInt(req.headers["content-length"], 10);

        if (storageLimit > 0 && currentUsage + fileSize > storageLimit) {
          return cb(new Error("Storage limit exceeded"), false);
        }
        cb(null, true);
      } catch (err) {
        console.error("Error calculating storage usage:", err);
        return cb(new Error("Error calculating storage usage"), false);
      }
    },
  }).array("files", 100);

  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: "Error uploading files: " + err.message });
    }

    res.status(200).json({
      message: "Files uploaded successfully",
      files: req.files.map((file) => file.filename),
    });
  });
};

exports.getUsage = (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;
  if (!roles[userRole]) {
    return res.status(403).json({ message: "Access denied: Invalid role" });
  }

  const currentUsage = getUserStorageUsage(userId);
  const storageLimitMB = roles[userRole].storageLimit;
  const storageLimit = storageLimitMB * 1024 * 1024;

  res.json({
    storageUsage: {
      total: currentUsage,
      limit: storageLimit,
    },
  });
};

exports.getFiles = (req, res) => {
  const userUploadPath = path.join("uploads/storage", `${req.user.id}`);
  console.log(userUploadPath);
  if (!fs.existsSync(userUploadPath)) {
    return res.json({ files: [] });
  }

  fs.readdir(userUploadPath, { encoding: "utf8" }, (err, files) => {
    if (err) return res.status(500).json({ message: "Error reading files" });

    const normalizedFiles = files.map((file) => {
      return Buffer.from(file, "latin1").toString("utf8");
    });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ files: normalizedFiles });
  });
};

exports.downloadFile = (req, res) => {
  const userUploadPath = path.join("uploads/storage", `${req.user.id}`);
  const filePath = path.join(
    process.cwd(),
    userUploadPath,
    req.params.filename
  );
  console.log(req.user.id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error serving file:", err);
    }
  });
};

exports.deleteFile = (req, res) => {
  const userUploadPath = path.join("uploads/storage", `${req.user.id}`);
  const filePath = path.join(userUploadPath, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ message: "Error deleting file" });

    res.json({ message: "File deleted successfully" });
  });
};

exports.shareFile = async (req, res) => {
  const userUploadPath = path.join("uploads/storage", `${req.user.id}`);
  const decodedFilename = decodeURIComponent(req.params.filename);
  const filePath = path.join(userUploadPath, decodedFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const shareToken = uuidv4();
  const password = req.body.password || null;
  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  if (!sharedFiles[decodedFilename]) {
    sharedFiles[decodedFilename] = [];
  }

  const expiryTime = req.body.expiryTime
    ? Date.now() + req.body.expiryTime
    : null;

  sharedFiles[decodedFilename].push({
    token: shareToken,
    sharedBy: req.user.id,
    expiryTime: expiryTime,
    password: hashedPassword,
  });

  saveSharedFiles();

  const encodedFilename = encodeURIComponent(decodedFilename);
  const shareUrl = `${BASE_URL}/api/storage/shared/${encodedFilename}/${shareToken}`;

  res.json({
    message: "File shared successfully",
    shareUrl: shareUrl,
    passwordProtected: !!password,
  });
};

exports.getSharedFile = async (req, res) => {
  const { filename, token } = req.params;
  const password = req.headers["x-share-password"];

  const decodedFilename = decodeURIComponent(filename);

  if (!sharedFiles[decodedFilename]) {
    return res.status(404).json({ message: "File not found or not shared" });
  }

  const shareEntry = sharedFiles[decodedFilename].find(
    (entry) => entry.token === token
  );

  if (!shareEntry) {
    return res.status(404).json({ message: "Invalid or expired share token" });
  }

  if (shareEntry.expiryTime && Date.now() > shareEntry.expiryTime) {
    cleanupExpiredEntries();
    return res.status(410).json({ message: "Share token has expired" });
  }

  if (shareEntry.password) {
    if (!password) {
      return res
        .status(401)
        .json({ message: "Password is required to access this file" });
    }

    const isPasswordValid = await bcrypt.compare(password, shareEntry.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid password" });
    }
  }

  const userUploadPath = path.join(
    process.cwd(),
    "uploads/storage",
    shareEntry.sharedBy.toString()
  );
  const filePath = path.join(userUploadPath, decodedFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  console.log(filePath);
  res.sendFile(filePath);
};
exports.getSharedInfo = async (req, res) => {
  const { filename, token } = req.params;

  const decodedFilename = decodeURIComponent(filename);

  if (!sharedFiles[decodedFilename]) {
    return res.status(404).send("<h1>File not found or not shared</h1>");
  }

  const shareEntry = sharedFiles[decodedFilename].find(
    (entry) => entry.token === token
  );

  if (!shareEntry) {
    return res.status(404).send("<h1>Invalid or expired share token</h1>");
  }

  const expiryTime = shareEntry.expiryTime
    ? new Date(shareEntry.expiryTime).toLocaleString()
    : "No expiry";

  const sharedBy = shareEntry.sharedBy;

  const userData = await getUserData(sharedBy);

  if (!userData) {
    return res.status(404).send("<h1>User not found</h1>");
  }

  const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shared File Information</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    max-width: 600px;
                    margin: auto;
                }
                h1 {
                    color: #333;
                }
                label {
                    font-weight: bold;
                }
                .info {
                    margin-bottom: 10px;
                }
                input[type="password"], button {
                    padding: 10px;
                    margin: 5px 0;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
                button {
                    background-color: #007BFF;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
                .message {
                    color: red;
                    margin-top: 10px;
                }
                .user-picture {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                }    
            </style>
        </head>
        <body>
            <h1>Shared File Information</h1>
            <div class="info">
                <label>File Name:</label> <span>${decodedFilename}</span>
            </div>
            <div class="info">
                <label>Shared By User:</label><img class="user-picture" src=${userData.profile_picture}> <span>${userData.username}</span>
            </div>
            <div class="info">
                <label>Available Until:</label> <span>${expiryTime}</span>
            </div>
            <form id="passwordForm">
                <label for="password">Enter Password:</label>
                <br>
                <input type="password" id="password" name="password" placeholder="Password">
                <br>
                <button type="submit">Download File</button>
            </form>
            <div class="message" id="message"></div>
            <script>
                document.getElementById('passwordForm').addEventListener('submit', async function (event) {
                    event.preventDefault();

                    const password = document.getElementById('password').value;

                    try {
                        const response = await fetch('/api/storage/shared/${filename}/${token}', {
                            method: 'GET',
                            headers: {
                                'x-share-password': password
                            }
                        });

                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = '${decodedFilename}';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                        } else {
                            const error = await response.json();
                            document.getElementById('message').textContent = error.message || 'Failed to download file.';
                        }
                    } catch (err) {
                        document.getElementById('message').textContent = 'An error occurred while downloading the file.';
                    }
                });
            </script>
        </body>
        </html>
    `;

  res.setHeader("Content-Type", "text/html");
  res.send(htmlContent);
};
