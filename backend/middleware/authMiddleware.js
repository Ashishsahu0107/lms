import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No token" });
    }

    const decoded = jwt.verify(token, "secret");

    // 🔥 FIX
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.log("Auth Error:", err);
    res.status(401).json({ msg: "Token invalid" });
  }
};