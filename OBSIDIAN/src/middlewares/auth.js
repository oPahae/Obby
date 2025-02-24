import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "1111";

export function verifyAuth(req, res) {
  const token = req.cookies?.authToken;

  if (!token) {
    return null;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return { id: user.id, username: user.username };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}