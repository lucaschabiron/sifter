import { MailOptions } from "$lib/types/mails.types";
import { sendMail } from "$lib/mailer";

export const sendWaitlistMail = async (email: string) => {
  const mailOptions: MailOptions = {
    from: 'Sifter <noreply@sifter-app.com>',
    to: email,
    subject: "Welcome to Sifter Waitlist",
    html: waitlistHTML,
  };
  try {
    await sendMail(mailOptions);
  } catch (error) {
    return error;
  }
};

const waitlistHTML = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Responsive Email Template</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <style>
        @media screen and (max-width: 600px) {
          .content {
            width: 100% !important;
            display: block !important;
            padding: 10px !important;
          }
          .header,
          .body,
          .footer {
            padding: 20px !important;
          }
        }
      </style>
      <body style="font-family: 'Inter', Arial, sans-serif">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 20px">
              <table
                class="content"
                width="600"
                border="0"
                cellspacing="0"
                cellpadding="0"
                style="border: 1px solid #969696; border-radius: 10px"
              >
                <!-- Header -->
                <tr>
                  <td
                    class="header"
                    style="
                      background-color: #060606;
                      padding: 40px;
                      text-align: center;
                      color: white;
                      font-size: 48px;
                      border-radius: 10px 10px 0 0;
                      letter-spacing: -1.8px;
                    "
                  >
                    <strong>Thank you for your interest in Sifter</strong>
                  </td>
                </tr>
    
                <!-- Body -->
                <tr>
                  <td
                    class="body"
                    style="
                      padding: 40px;
                      text-align: left;
                      font-size: 16px;
                      line-height: 1.6;
                      background-color: #eee;
                      letter-spacing: -0.7px;
                      color: #222;
                    "
                  >
                    Hi ! <br />
                    Thank you so much for your interest in Sifter !
                    <br />
                    <br />
                    We are excited to have you on board. We'll give you a heads up
                    when we're ready to launch.
                    <br />
                    <br />
                    <strong>Welcome to the Sifter Waitlist!</strong>
                  </td>
                </tr>
    
                <!-- Footer -->
                <tr>
                  <td
                    class="footer"
                    style="
                      background-color: #060606;
                      padding: 40px;
                      text-align: center;
                      color: white;
                      font-size: 14px;
                      border-radius: 0 0 10px 10px;
                    "
                  >
                    Copyright &copy; 2024 | Sifter
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html> `;
