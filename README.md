# Stock Checker Bot

## Overview
This Node.js script periodically checks the stock availability of specific products on a website. If a product is back in stock, it sends an SMS notification using Twilio and an email via Nodemailer.

## Features
- Scrapes product pages using **Axios** and **Cheerio**
- Sends SMS alerts via **Twilio**
- Sends email notifications via **Nodemailer**
- Runs at set intervals to check stock updates

## Prerequisites
Ensure you have the following installed:
- **Node.js** (latest LTS version recommended)
- **npm** (comes with Node.js)

## Installation
1. Clone the repository:
   ```sh
   git clone <repository_url>
   cd <project_directory>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Environment Variables
Create a `.env` file in the root directory and add the following:
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_NUMBER=your_twilio_phone_number
PHONE_NUMBER=your_phone_number
EMAIL=your_email
EMAIL_PASSWORD=your_email_password
```
**Note:** Never share your `.env` file or commit it to GitHub.

## Usage
Run the script with:
```sh
node index.js
```
This will start the stock checker and send notifications when an item is restocked.

## How It Works
1. The script fetches product pages and checks if they are marked as "Sold Out".
2. If a product is in stock, it sends an SMS and an email notification.
3. It continuously runs at set intervals:
   - **Every 30 seconds**: Checks stock availability.
   - **Every 6 hours**: Sends a status update.

## Deployment
To keep the script running continuously, deploy it on a cloud service like **Render**, **Heroku**, or a **VPS**.

## Contributing
Feel free to open issues or submit pull requests to improve this project.

## License
This project is licensed under the MIT License.

