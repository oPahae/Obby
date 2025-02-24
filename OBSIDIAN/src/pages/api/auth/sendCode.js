import nodemailer from 'nodemailer';
import connect from '../lib/connect';
import VerificationCode from '../models/VerifCode';
import User from '../models/User';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        await connect();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user with this email ._.' });
        }

        const code = Math.floor(100000 + Math.random() * 900000);
        await VerificationCode.findOneAndUpdate(
            { email },
            { email, code, createdAt: new Date() },
            { upsert: true, new: true }
        );

        setTimeout(async () => {
            await VerificationCode.findOneAndDelete({ email });
            console.log(`Code pour ${email} supprimé après 5 minutes.`);
        }, 300000); // 5 minutes

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            auth: {
                user: process.env.BREVO_USER,
                pass: process.env.BREVO_API,
            },
        });

        try {
            await transporter.sendMail({
                from: process.env.BREVO_SENDER,
                to: email,
                subject: 'Code de vérification',
                text: `Votre code de vérification est : ${code}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
                        <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                            Hello,
                        </p>
                        <p style="font-size: 16px; line-height: 1.5; text-align: center;">
                            Please verify your email address. Your verification code is:
                        </p>
                        <p style="font-size: 24px; font-weight: bold; text-align: center; color: #4CAF50;">
                            ${code}
                        </p>
                        <p style="font-size: 14px; line-height: 1.5; text-align: center; color: #777;">
                            This code is valid for 5 minutes. If you did not request this code, please ignore this email.
                        </p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="#" style="text-decoration: none; background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                                I got it, Thanks !
                            </a>
                        </div>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="font-size: 12px; text-align: center; color: #aaa;">
                            This email was sent automatically, please do not respond to it.
                        </p>
                    </div>
                `
            });

            return res.status(200).json({ message: 'Verification code sent!' });
        } catch (message) {
            console.message('Erreur lors de l\'envoi de l\'email :', message);
            return res.status(500).json({ message: 'Failed to send email', details: message.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}