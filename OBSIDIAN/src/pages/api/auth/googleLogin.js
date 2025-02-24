import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { serialize } from "cookie";
import bcrypt from "bcryptjs";
import connect from "../lib/connect";
import User from "../models/User";

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
    const { email, name, picture } = payload;

    await connect(); // Connexion à la base de données

    // Rechercher si l'utilisateur existe déjà
    let user = await User.findOne({ email });

    if (!user) {
      // CAS 1 : L'utilisateur n'existe pas, le créer
      const username = payload.name; // Générer un nom d'utilisateur par défaut à partir de l'email
      const hashedPassword = await bcrypt.hash(email + JWT_SECRET, 10); // Mot de passe sécurisé généré automatiquement

      user = new User({
        username,
        email,
        password: hashedPassword,
        bio: "",
        age: null,
        sex: null,
        country: null,
        rooms: [],
        img: picture || "", // Utilise l'image Google si disponible
      });

      await user.save();
    }

    // CAS 2 : L'utilisateur existe déjà, continuer avec le login

    // Générer un jeton JWT
    const jwtToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "1d",
    });

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
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid Google token" });
  }
}