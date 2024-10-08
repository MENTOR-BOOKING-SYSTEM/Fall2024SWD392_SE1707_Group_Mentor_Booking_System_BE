import nodemailer, { Transporter } from 'nodemailer'
import { envConfig } from '~/constants/config'

class EmailService {
  private transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      secure: true,
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: envConfig.nodeMailerEmail,
        pass: envConfig.nodeMailerPassword
      }
    })
  }

  sendEmail({ to, subject, body }: { to: string[]; subject: string; body: string }) {
    return this.transporter.sendMail({
      from: envConfig.nodeMailerEmail,
      to,
      subject,
      html: body
    })
  }
}

const emailService = new EmailService()
export default emailService
