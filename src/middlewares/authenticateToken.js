const jwt = require("jsonwebtoken");
const JWT_SECRET = "myveryveryseretcode";
const roles = require("../roles.json").roles;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.query.token;

  if (token == null) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
}

function checkPermission(permission) {
  return (req, res, next) => {
    console.log("Roles object:", roles);
    const userRole = req.user.role;
    console.log("A " + userRole);
    console.log(roles[userRole]);
    if (roles && roles[userRole].permissions.includes(permission)) {
      return next();
    } else {
      return res
        .status(403)
        .json({ error: "Access denied: You don't have permission" });
    }
  };
}
module.exports = { authenticateToken, checkPermission };
