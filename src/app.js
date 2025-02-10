const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const ngrok = require("@ngrok/ngrok");
const http = require("http");
const dashboardRoutes = require("./routes/dashboardRoutes");
const minecraftRoutes = require("./routes/minecraftRoutes");
const screenshotRoutes = require("./routes/screenshotRoutes");
const storagerRoutes = require("./routes/storagerRoutes");
const systemRoutes = require("./routes/systemRoutes");
const setupWebsocket = require("./websocket/systemWebsocket");
const tetrisRoutes = require("./routes/tetrisRoutes");
const userRoutes = require("./routes/userRoutes");
const { exiftool } = require("exiftool-vendored");

const {
  requestLogger,
  errorLogger,
} = require("./middlewares/loggerMiddleware");
const path = require("path");
const WebSocket = require("ws");

const initWebSocket = require("./websocket/consoleWebsocket");

const app = express();
const wsServer = new WebSocket.Server({ port: 8080 });
const wsServer2 = new WebSocket.Server({ port: 8081 });
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => {
    return req.ip || req.headers["x-forwarded-for"];
  },
});

app.use(limiter);

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));

app.use(requestLogger);
app.use(errorLogger);

app.use("/css", express.static(path.join(__dirname, "public", "css")));
app.use("/js", express.static(path.join(__dirname, "public", "js")));

app.set("trust proxy", "loopback");

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test.html"));
});

app.get("/404", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/backups", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "backups.html"));
});

app.get("/cards", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cards.html"));
});

app.get("/console", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "console.html"));
});

app.get("/edit-profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "edit-profile.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.set("view engine", "ejs");
app.get("/screenshots", async (req, res) => {
  const directoryPath = path.join(__dirname, "uploads/screenshots");
  const images = fs.readdirSync(directoryPath);

  const imageDataPromises = images.map(async (file) => {
    const filePath = path.join(directoryPath, file);
    const metadata = await extractMetadata(filePath);
    return { filename: file, metadata };
  });

  const imageData = await Promise.all(imageDataPromises);
  console.log(imageData);
  res.render("screenshots", { images: imageData });
});

async function extractMetadata(filePath) {
  try {
    const metadata = await exiftool.read(filePath);
    const userComment = metadata["UserComment"] || `{"message": "No comment"}`;
    return {
      userComment: JSON.parse(userComment),
      uploadTime: metadata.FileModifyDate || "Unknown",
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return {
      userComment: "Error reading metadata",
      uploadTime: "Unknown",
    };
  }
}

app.get("/storage", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "storage.html"));
});

app.get("/groups", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "groups.html"));
});

app.get("/terminal", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "terminal.html"));
});

app.get("/tetris", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tetris.html"));
});

app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "users.html"));
});

app.get("/widgets.json", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "widgets.json"));
});

app.get("/test2", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test2.html"));
});

app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use("/widgets", express.static(path.join(__dirname, "public", "widgets")));

app.use(
  "/uploads/profile-pictures",
  express.static(path.join("uploads", "profile-pictures"))
);
app.use(
  "/uploads/screenshots",
  express.static(path.join("uploads", "screenshots"))
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", dashboardRoutes);
app.use("/", minecraftRoutes);
app.use("/", screenshotRoutes);
app.use("/", storagerRoutes);
app.use("/", systemRoutes);
app.use("/", tetrisRoutes);
app.use("/", userRoutes);

app.get("/404", (req, res) => {
  res.status(404).render("errorPage", {
    errorCode: 404,
    errorMessage:
      "It seems you've ventured too far into the void...<br>You're drifting farther from the page you're looking for.",
    backgroundClass: "stars-background",
  });
});

const errorMessages = {
  404: "It seems you've ventured too far into the void...<br>You're drifting farther from the page you're looking for.",
  500: "Oops! Something went wrong on our end.<br>I'm working to fix it.",
  403: "Forbidden!<br>You're not allowed to access this page.",
  401: "Unauthorized!<br>You need to log in to view this page.",
  400: "Bad Request!<br>The server could not understand your request.",
};

app.use((req, res) => {
  const errorCode = 404;
  res.status(errorCode).render("errorPage", {
    errorCode: errorCode,
    errorMessage: errorMessages[errorCode] || "An unknown error has occurred.",
  });
});

app.use((err, req, res) => {
  const errorCode = err.status || 500;
  res.status(errorCode).render("errorPage", {
    errorCode: errorCode,
    errorMessage: errorMessages[errorCode] || "An unknown error has occurred.",
  });
});

initWebSocket(wsServer);
setupWebsocket(wsServer2);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

ngrok
  .connect({
    addr: 80,
    authtoken: process.env.NGROK_AUTHTOKEN,
    domain: process.env.NGROK_DOMAIN,
  })
  .then((listener) => console.log(`Ingress established at: ${listener.url()}`));
