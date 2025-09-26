# Laundry Management System (LMS)

This project is a simple yet functional Laundry Management System (LMS) built using a front‑end JavaScript application and Firebase as the backend. It allows you to manage customers, services, visits, invoices, and reports from a clean, responsive web interface. It also demonstrates how to integrate messaging services (e.g. Twilio) and automated scheduled tasks via Firebase Cloud Functions.

## Features

- **Customer Management** – Add, edit, and search customers by name or phone number. Each customer is stored in a Firestore collection.
- **Service Management** – Define laundry services with names and prices. Services can be edited and selected for visits.
- **Visit Management** – Create new visits for customers, select services and quantities, apply discounts, urgent multipliers, and VAT. Visits track status (Received, Ready, Delivered) with timestamps and store an invoice.
- **Invoice Generation** – Automatically generate a simple invoice HTML for each visit and display it in a modal. Invoices can be printed or sent via messaging APIs.
- **Report Generation** – Generate daily, weekly, monthly, or yearly reports summarizing revenue and service usage. Custom date ranges are supported.
- **Activity Tracking** – Every significant action (adding a customer/service, updating a visit) is logged in an `activities` collection.
- **Language Support** – The UI can be toggled between English and Arabic. Strings are defined in a translation dictionary.
- **Cloud Functions** – The `functions/index.js` file contains example Firebase Cloud Functions for sending notifications and invoices via Twilio and generating daily reports.

## Getting Started

1. **Clone or download the repository**

   ```bash
   git clone https://github.com/your‑username/Laundry-Management-System.git
   ```

2. **Create a Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
   - Add a **Web App** to your project and copy its configuration (apiKey, projectId, etc.).
   - In the Firebase console, enable **Firestore** in native mode. Create the collections `customers`, `services`, `visits`, and `activities` (documents will be created automatically when you add data).
   - (Optional) If you plan to deploy Cloud Functions, install the Firebase CLI (`npm install -g firebase-tools`), initialize functions in the `functions/` directory, and deploy.

3. **Update Firebase Configuration**

   Open `firebase-config.js` and replace the placeholder values with your Firebase project settings:

   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Configure Messaging (Twilio)**

   The Cloud Functions in `functions/index.js` are set up to send SMS messages using Twilio. To enable this:

   - Create an account at [Twilio](https://www.twilio.com/) and obtain your `Account SID`, `Auth Token`, and a `Phone Number` capable of sending SMS.
   - In your Firebase project, go to **Functions** → **Environment variables** and set the following variables:

     ```bash
     firebase functions:config:set twilio.account_sid="YOUR_SID" twilio.auth_token="YOUR_TOKEN" twilio.phone_number="+123456789"
     firebase deploy --only functions
     ```
   - Or set them as process environment variables when running locally.
   - The provided functions `notifyCustomer` and `sendInvoice` will attempt to send SMS messages. If Twilio credentials are not configured, they will simply log what they would send.

5. **Deploy with GitHub Pages**

   This project is designed to be served as a static site (the Firebase client SDK runs entirely in the browser). After pushing your code to GitHub:

   - Go to your repository’s **Settings** → **Pages** and select the main branch (root directory) as the source. Save the settings.
   - GitHub Pages will build and host your site. The URL will be displayed once deployment is complete.
   - Make sure `index.html`, `styles.css`, `main.js`, and `firebase-config.js` are in the root of the repository or the selected branch.

6. **Optional: Deploy Cloud Functions**

   - Change into the `functions` directory and run `npm install` to install dependencies.
   - Deploy the functions to Firebase:

     ```bash
     firebase deploy --only functions
     ```
   - Ensure you have configured environment variables for Twilio (see step 4).

7. **Scheduling Reports**

   The Cloud Function `dailyReport` uses a Pub/Sub schedule to run every day at 8 AM Muscat time. You can modify the schedule expression in `functions/index.js` to change the frequency (e.g. weekly or monthly). To send reports via email or SMS, integrate an email service or Twilio inside this function.

## Usage

1. Open the deployed site in your browser.
2. Use the sidebar to navigate between **Customers**, **Services**, **Visits**, and **Reports**.
3. Add customers and services as needed.
4. Create visits by selecting a customer, checking the services used, specifying quantities, discounts, urgency, and VAT. An invoice will be generated automatically.
5. Change visit status to **Ready** or **Delivered**. The system will (optionally) send notifications to the customer using Twilio.
6. Generate reports by selecting the desired time period or custom dates.

## Notes

* This is a sample implementation intended for educational purposes. In a production environment, you should implement proper authentication and authorization to restrict access to authorized users only.
* Twilio charges for SMS messages beyond their free trial. Always test with trial credentials and numbers before using paid services.
* The UI uses Bootstrap for responsiveness. You can further customize the look by editing `styles.css` or importing another CSS framework.

## License

This project is provided under the MIT License. See `LICENSE` for details.