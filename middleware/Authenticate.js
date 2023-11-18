// Middleware for user authentication
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, "secret_key");
    req.userId = decodedToken.userId;

    // Check if the user is online
    const user = await User.findById(req.userId);
    if (!user || !user.online) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
module.exports = authenticateUser;
