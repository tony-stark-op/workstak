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

    async sendTaskDeletionNotification(task: any, deletedBy: string) {
        try {
            const recipients = ['support@cloudbyadi.com', 'adityalate@cloudbyadi.com'];

            const info = await this.transporter.sendMail({
                from: `"WorkStack Notifications" <${process.env.SMTP_USER}>`,
                to: recipients.join(', '),
                subject: `Task Deleted: ${task.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; border-left: 5px solid #ef4444;">
                        <h2 style="color: #ef4444;">Task Deletion Alert</h2>
                        <p>The following task has been deleted from WorkStack.</p>
                        
                        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Title:</strong> ${task.title}</p>
                            <p style="margin: 5px 0;"><strong>Description:</strong> ${task.description || 'No description'}</p>
                            <p style="margin: 5px 0;"><strong>Project:</strong> ${task.project || 'N/A'}</p>
                            <p style="margin: 5px 0;"><strong>Assigned To:</strong> ${task.assignee?.email || task.assignee?.username || 'Unassigned'}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> ${task.status}</p>
                            <hr style="border: 0; border-top: 1px solid #fee2e2; margin: 10px 0;"/>
                            <p style="margin: 5px 0; font-size: 0.9em; color: #666;"><strong>Deleted By:</strong> ${deletedBy}</p>
                        </div>

                        <p style="font-size: 12px; color: #6b7280;">This is an automated notification required for compliance.</p>
                    </div>
                `,
            });
            console.log("[Email Service] Deletion notification sent: %s", info.messageId);
        } catch (error) {
            console.error("[Email Service] Error sending deletion notification:", error);
        }
    }
}

export default new EmailService();
