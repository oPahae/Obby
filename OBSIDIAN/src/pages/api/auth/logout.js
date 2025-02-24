import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Supprimez le cookie en le réinitialisant avec une date d'expiration passée
    res.setHeader('Set-Cookie', serialize('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Cookie expiré immédiatement
    }));

    return res.status(200).json({ message: 'Logout successful' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}
