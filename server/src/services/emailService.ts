import nodemailer from 'nodemailer';

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendCredentials(to: string, username: string, password: string) {
        try {
            const info = await this.transporter.sendMail({
                from: `"WorkStack Security" <${process.env.SMTP_USER}>`, // sender address
                to, // list of receivers
                subject: "Your WorkStack Access Credentials", // Subject line
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #0f766e;">Welcome to WorkStack!</h2>
                        <p>Your account has been successfully created. Please use the following temporary credentials to log in.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; background-color: #e5e7eb; padding: 2px 5px; rounded: 4px;">${password}</span></p>
                        </div>

                        <p>For security reasons, you will be required to change your password upon your first login.</p>
                        <br/>
                        <a href="http://localhost:3000/login" style="background-color: #0f766e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
                        <br/><br/>
                        <p style="font-size: 12px; color: #6b7280;">If you did not request this account, please ignore this email.</p>
                    </div>
                `,
            });
            console.log("Message sent: %s", info.messageId);
        } catch (error) {
            console.error("Error sending email:", error);
            // Don't block registration flow, but log error
        }
    }
}

export default new EmailService();
