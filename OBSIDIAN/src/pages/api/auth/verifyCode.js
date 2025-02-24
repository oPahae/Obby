import connect from '../lib/connect';
import VerificationCode from '../models/VerifCode';

export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

      await connect();
      const verificationRecord = await VerificationCode.findOne({ email });

      if (!verificationRecord) {
          return res.status(400).json({ message: 'No verification code found for this email' });
      }

      if (verificationRecord.code === code) {
          await VerificationCode.deleteOne({ email });
          return res.status(200).json({ message: 'Code verified' });
      }

      return res.status(400).json({ message: 'Invalid code or email' });
  } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}