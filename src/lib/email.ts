import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
// Remove spaces from app password just in case
const emailPass = (
  process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS
)?.replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const isBlockedRecipientEmail = (email: string) => {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1] || "";
  const blockedDomains = ["nextclass.com", "example.com", "test.com"];
  return blockedDomains.includes(domain);
};

export const sendOTP = async (email: string, otp: string) => {
  if (!emailUser || !emailPass) {
    console.error(
      "Missing email credentials. Make sure EMAIL_USER and EMAIL_PASSWORD are set in your .env file."
    );
    return false;
  }

  console.log(`Attempting to send OTP email from: ${emailUser}`);

  const mailOptions = {
    from: process.env.EMAIL_FROM || emailUser, // Use EMAIL_FROM if set, otherwise default to EMAIL_USER
    to: email,
    subject: "NextClass Hub - Verify your account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your Email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); padding: 32px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">NEXT<span style="color: #a7f3d0;">CLASS</span></h1>
              <p style="margin: 8px 0 0; color: #ecfdf5; font-size: 16px; opacity: 0.9;">Your Learning Journey Starts Here</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 32px; text-align: center;">
              <div style="margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 700;">Verify Your Email Address</h2>
                <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Thanks for joining NextClass Hub! specific Please enter the following verification code to complete your registration.</p>
              </div>

              <!-- OTP Box -->
              <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 24px; margin: 32px 0; display: inline-block;">
                <span style="display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #059669; font-weight: 600; margin-bottom: 8px;">Verification Code</span>
                <span style="display: block; font-size: 36px; font-weight: 800; color: #047857; letter-spacing: 6px; font-family: monospace;">${otp}</span>
              </div>

              <p style="margin: 0; color: #6b7280; font-size: 14px;">This code will expire in <strong style="color: #374151;">10 minutes</strong>.</p>
              
              <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} NextClass Hub. All rights reserved.</p>
              <div style="margin-top: 12px;">
                <a href="#" style="color: #059669; text-decoration: none; font-size: 12px; margin: 0 8px;">Help Center</a>
                <a href="#" style="color: #059669; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
                <a href="#" style="color: #059669; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms</a>
              </div>
            </div>

          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendContactEmail = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  if (!emailUser || !emailPass) {
    console.error("Missing email credentials.");
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || emailUser,
    to: emailUser, // Send to admin/support
    replyTo: data.email, // Allow replying to the user
    subject: `NextClass Contact: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #10B981; padding: 20px; text-align: center;">
              <h2 style="color: white; margin: 0;">New Contact Message</h2>
            </div>
            <div style="padding: 30px;">
              <p style="color: #666; font-size: 14px; margin-bottom: 20px;">You have received a new message from the contact form.</p>
              
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${data.subject}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Message:</h3>
                <p style="color: #444; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Contact email sent from ${data.email}`);
    return true;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
};

export const sendInvoiceEmail = async (data: {
  to: string;
  invoiceNumber: string;
  totalAmount: string;
  invoiceUrl: string;
}) => {
  if (!emailUser || !emailPass) {
    console.error("Missing email credentials.");
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || emailUser,
    to: data.to,
    subject: `NextClass Invoice ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Your Invoice is Ready</h2>
        <p>Thank you for your purchase on NextClass.</p>
        <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
        <p><strong>Total:</strong> ${data.totalAmount}</p>
        <p>
          <a href="${data.invoiceUrl}" style="display: inline-block; padding: 10px 16px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px;">
            View Invoice
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return false;
  }
};

export const sendNotificationsDigestEmail = async (data: {
  to: string;
  userName: string;
  appUrl: string;
  notifications: Array<{
    title: string;
    description: string;
    href: string;
    createdAt: string;
  }>;
}) => {
  if (!emailUser || !emailPass) {
    console.error("Missing email credentials.");
    return false;
  }

  const topItems = data.notifications.slice(0, 15);

  const rows =
    topItems.length > 0
      ? topItems
          .map((item) => {
            const absoluteUrl = `${data.appUrl}${item.href}`;
            const created = new Date(item.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #111827;">${item.title}</p>
                  <p style="margin: 0 0 6px; font-size: 13px; color: #4b5563;">${item.description}</p>
                  <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280;">${created}</p>
                  <a href="${absoluteUrl}" style="font-size: 12px; color: #059669; text-decoration: none;">Open notification</a>
                </td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            No new notifications right now.
          </td>
        </tr>
      `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || emailUser,
    to: data.to,
    subject: "NextClass Notifications Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #111827;">Hi ${data.userName},</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.6;">
          Here is your latest activity update from NextClass.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px;">
          ${rows}
        </table>
        <p style="margin-top: 18px;">
          <a href="${data.appUrl}/my-courses" style="display: inline-block; padding: 10px 16px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">
            Open My Courses
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending notifications email:", error);
    return false;
  }
};

export const sendAutomatedStudentNotificationEmail = async (data: {
  to: string;
  userName: string;
  eventTitle: string;
  eventDescription: string;
  actionUrl: string;
  actionLabel: string;
}) => {
  if (!emailUser || !emailPass) {
    console.error("Missing email credentials.");
    return false;
  }

  if (isBlockedRecipientEmail(data.to)) {
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || emailUser,
    to: data.to,
    subject: `NextClass Update: ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
        <h2 style="color: #111827; margin-bottom: 8px;">Hi ${data.userName},</h2>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-top: 0;">
          ${data.eventTitle}
        </p>
        <div style="padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb;">
          <p style="margin: 0; color: #111827; font-size: 14px;">${data.eventDescription}</p>
        </div>
        <p style="margin-top: 18px;">
          <a href="${data.actionUrl}" style="display: inline-block; padding: 10px 16px; background: #059669; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">
            ${data.actionLabel}
          </a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending automated notification email:", error);
    return false;
  }
};
