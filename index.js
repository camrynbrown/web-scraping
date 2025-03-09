const axios = require('axios');
const cheerio = require('cheerio');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
require('dotenv').config();

let soldOut = [];
let inStock = [];
const SIX_HOURS = 21600000;
const HALF_MINUTE = 60000/2;
const HOUR = 3600000;
const timestamp = new Date().toLocaleString();

/**
 * Initializes the stock checker by iterating through product URLs.
 * Sends an SMS update if the `bool` flag is set to false.
 * 
 * @param {boolean} bool - Determines whether to send an SMS update if items are still out of stock.
 */

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


/**
 * Checks the stock availability of a given product by scraping its webpage.
 * Updates the `soldOut` and `inStock` lists accordingly.
 * 
 * @param {string} productName - The name of the product.
 * @param {string} url - The product page URL.
 */

async function checkStock(productName, url) {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const isOutOfStock = $('div.product__tag--sold_out').length > 0;
        
        if (!isOutOfStock) {
            // console.log(`${productName} is back in stock!`);
            if (soldOut.includes(productName)) {
                soldOut = soldOut.filter(item => item !== productName);
            }

            if (!inStock.includes(productName)) {
                inStock.push(productName);
                sendSMS(inStock, url, false);
            }

            //sendText(productName, url);
        } else {
            //console.log(`${productName} is not in stock!`);
            if (!soldOut.includes(productName)) {
                soldOut.push(productName)
            }
            
        }
    } catch (error) {
        console.error('Error fetching the page:', error);
    }
}

/**
 * Sends an SMS notification via Twilio when an item is back in stock.
 **/

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

/**
 * Sends an SMS update via email-to-SMS gateway. Can be used for both
 * back-in-stock notifications and periodic status updates.
 **/

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

/**
 * Triggers a scheduled status update by calling `setup` with `false` to check stock
 * without sending regular notifications.
 **/

function statusUpdate() {
    console.log("Status Update.")
    setup(false);
}

console.log("Started at: " + timestamp);

// Runs the stock check every 30 seconds
setInterval(setup, HALF_MINUTE);

// Sends a status update every 6 hours
setInterval(statusUpdate, SIX_HOURS);

setup();
//statusUpdate();