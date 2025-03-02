const axios = require('axios');
const cheerio = require('cheerio');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
require('dotenv').config();

let soldOut = [];
const SIX_HOURS = 21600000;
const HALF_MINUTE = 60000/2;
const HOUR = 3600000;
const timestamp = new Date().toLocaleString();

async function setup(bool = true) {
    

    const urls = {
        productName: ["Photobook A Version", "Photobook B Version", "Mystery Box Version"],
        url: ["https://itzyshop.com/products/air-photobook-a-ver-signed", "https://itzyshop.com/products/air-photobook-b-ver-signed", "https://itzyshop.com/products/mystery-box-ver-signed"]
    }

    for (let i = 0; i < urls.productName.length; i++) {
        await checkStock(urls.productName[i], urls.url[i]);
    }
    
    if (bool == false) {
        sendSMS(soldOut, null, true);
    }
}  

async function checkStock(productName, url) {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const isOutOfStock = $('div.product__tag--sold_out').length > 0;
        
        if (!isOutOfStock) {
            console.log(`${productName} is back in stock!`);
            if (soldOut.includes(productName)) {
                soldOut = soldOut.filter(item => item !== productName);
            } 
                        
            //sendText(productName, url);
            sendSMS(productName, url, false);
        } else {
            //console.log(`${productName} is not in stock!`);
            if (!soldOut.includes(productName)) {
                soldOut.push(productName)
            }
            //console.log(soldOut);
            //setInterval(() => sendSMS(productName, url, true), 21600000);
        }
    } catch (error) {
        console.error('Error fetching the page:', error);
    }
}

function sendText(productName, url) {
    const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    client.messages.create({
        body: `The ${productName} is back in stock! Check it out ${url}.`,
        from: '+1' + process.env.TWILIO_NUMBER,  // Your Twilio phone number
        to: '+1' + process.env.PHONE_NUMBER  // Your phone number
    }).then(message => {
        console.log('Text sent:', message.sid);
    }).catch(error => {
        console.error('Error sending text:', error);
    });
}

function sendSMS(productName, url, bool = false) {
    const phoneNumber = process.env.PHONE_NUMBER;
    const timestamp = new Date().toLocaleString();
    let message = `The ${productName} is back in stock! Check it out ${url}.`;

    if (bool == true) {
        message = `Still running! The albums: ${productName} are still not in stock. (NEW) - ${timestamp}`;
        console.log(message);
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: `${phoneNumber}@vtext.com`,
        subject: '',
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending SMS:', error);
        } else {
            console.log('Message sent:', info.response);
        }
    });
}

function statusUpdate() {
    console.log("Status Update.")
    setup(false);
}

console.log("Started at: " + timestamp);


setInterval(setup, HALF_MINUTE);
setInterval(statusUpdate, SIX_HOURS);

// setup();
// statusUpdate();