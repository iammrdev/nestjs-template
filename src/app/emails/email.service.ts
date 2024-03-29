import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Mailer } from '../../libs/mailer';

const buildConfirmationMessage = (code: string): string => {
  return `
        <h1>Thank for your registration</h1>\n
        <p>To finish registration please follow the link below:\n
        <a href='http://localhost:5000/confirm-email?code=${code}'>complete registration</a>
        </p>
 `;
};

const buildRecoveryMessage = (code: string): string => {
  return `
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='http://localhost:5000/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>
 `;
};

type EmailParams = {
  email: string;
  code: string;
};

const sendEmail = async ({
  email,
  code,
}: EmailParams): Promise<SMTPTransport.SentMessageInfo> => {
  return Mailer.send({
    email: email,
    subject: 'Confirm email',
    message: buildConfirmationMessage(code),
  });
};

const sendRecoveryEmail = async ({
  email,
  code,
}: EmailParams): Promise<SMTPTransport.SentMessageInfo> => {
  return Mailer.send({
    email: email,
    subject: 'Recovery password',
    message: buildRecoveryMessage(code),
  });
};

export const EmailService = {
  sendEmail,
  sendRecoveryEmail,
};
