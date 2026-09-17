/* eslint-disable no-else-return */
// const { Resend } = require('resend');

const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Amr Shahin <${process.env.GMAIL_USER_PROD}>`;
  }

  newTransport() {
    //1) create a transporter
    if (process.env.NODE_ENV === 'development') {
      //SMTP server: mailtrap
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST_DEV,
        port: process.env.EMAIL_PORT_DEV,
        auth: {
          user: process.env.EMAIL_USERNAME_DEV,
          pass: process.env.EMAIL_PASSWORD_DEV,
        },
      });
    } else {
      // Production: GMAIL SMTP
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST_PROD,
        port: process.env.EMAIL_PORT_PROD,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER_PROD,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    }
  }

  //send the actual email
  async send(template, subject) {
    //1)Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        //passed variables to the template's local scope
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    //2) Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 min)!',
    );
  }
};
