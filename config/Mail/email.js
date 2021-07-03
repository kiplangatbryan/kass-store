const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: 'key-1234123412341234',
        domain: 'one of your domain names listed at your https://mailgun.com/app/domains'
    }
}

const Transport = nodemailer.createTransport(mailgun(auth));

module.exports = Transport
