import nodemailer from 'nodemailer';

interface SendMethodParams {
  email: string;
  subject: string;
  message: string;
}

export class Mailer {
  static send = async (params: SendMethodParams) => {
    const { email, subject, message } = params;

    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: 'iashchuk.dev@mail.ru',
        pass: '6AGbkEegyJRVWBjZHdiY',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: '"Node App" <iashchuk.dev@mail.ru>',
      to: email,
      subject,
      html: message,
    });

    return info;
  };
}
