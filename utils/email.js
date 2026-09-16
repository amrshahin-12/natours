/* eslint-disable no-else-return */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Amr Shahin <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    //1) create a transporter
    if (process.env.NODE_ENV === 'development') {
      //SMTP server: mailtrap
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      //sendgrid
      return 1;
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
};

// const sendEmail = async (options) => {
//   //2) define the email options
//   // const mailOptions = {
//   //   from: 'Amr Shahin <test1@gmail.com>',
//   //   to: options.email,
//   //   subject: options.subject,
//   //   text: options.message,
//   // };
//   //3) actually send the email
//   // await transporter.sendMail(mailOptions);
// };
