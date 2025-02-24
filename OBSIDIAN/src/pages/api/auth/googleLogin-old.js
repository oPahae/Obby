import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { serialize } from "cookie";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Missing Google token" });
  }

  try {
    // Vérification du token Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Extraire les informations utilisateur
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // Créer un JWT
    const jwtToken = jwt.sign({ id: user.id, username: user.name }, JWT_SECRET, { expiresIn: "1d" });

    // Enregistrer le jeton dans un cookie
    const serialized = serialize("authToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 jour
      path: "/",
    });

    // Ajouter le cookie à la réponse
    res.setHeader("Set-Cookie", serialized);

    return res.status(200).json({
      message: "Login successful",
      username: user.name,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid Google token" });
  }
}
