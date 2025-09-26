// Firebase Cloud Functions for LMS
// This file defines callable functions and scheduled tasks for messaging and reporting.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();
const db = admin.firestore();

// Twilio configuration from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Callable function to notify customer when status changes.
 * Expects data = { visitId: string, status: 'ready' | 'delivered' }.
 */
exports.notifyCustomer = functions.https.onCall(async (data, context) => {
  const { visitId, status } = data;
  if (!visitId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'visitId and status are required');
  }
  const visitDoc = await db.collection('visits').doc(visitId).get();
  if (!visitDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Visit not found');
  }
  const visit = visitDoc.data();
  const customerDoc = await db.collection('customers').doc(visit.customerId).get();
  const phone = customerDoc.exists ? customerDoc.data().phone : null;
  if (!phone) {
    console.warn('Customer phone not found for', visit.customerId);
    return { message: 'No phone number' };
  }
  const statusMessages = {
    ready: 'Your laundry is ready for pickup.',
    delivered: 'Your laundry has been delivered.'
  };
  const body = statusMessages[status] || 'Update on your laundry order.';
  if (client) {
    try {
      await client.messages.create({
        from: twilioPhone,
        to: phone,
        body
      });
      return { message: 'Notification sent' };
    } catch (err) {
      console.error('Twilio error', err);
      return { message: 'Failed to send notification' };
    }
  } else {
    console.log(`Would send message to ${phone}: ${body}`);
    return { message: 'Twilio not configured' };
  }
});

/**
 * Callable function to send invoice via messaging or email.
 * Expects data = { visitId: string }.
 */
exports.sendInvoice = functions.https.onCall(async (data, context) => {
  const { visitId } = data;
  if (!visitId) {
    throw new functions.https.HttpsError('invalid-argument', 'visitId is required');
  }
  const visitDoc = await db.collection('visits').doc(visitId).get();
  if (!visitDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Visit not found');
  }
  const visit = visitDoc.data();
  const customerDoc = await db.collection('customers').doc(visit.customerId).get();
  const phone = customerDoc.exists ? customerDoc.data().phone : null;
  const invoiceHtml = visit.invoiceHtml || '';
  if (!invoiceHtml) {
    return { message: 'No invoice to send' };
  }
  if (client && phone) {
    try {
      await client.messages.create({
        from: twilioPhone,
        to: phone,
        body: `Your invoice for visit ${visitId}:\nTotal: ${visit.total.toFixed(2)}`
      });
      return { message: 'Invoice sent via SMS' };
    } catch (err) {
      console.error(err);
      return { message: 'Failed to send invoice' };
    }
  } else {
    console.log(`Would send invoice to ${phone}: total ${visit.total}`);
    return { message: 'Twilio not configured' };
  }
});

/**
 * Scheduled function to generate daily reports and send to admin via email/SMS.
 * Adjust schedule as needed: daily, weekly, monthly, yearly.
 */
exports.dailyReport = functions.pubsub.schedule('0 8 * * *').timeZone('Asia/Muscat').onRun(async context => {
  // Generate a summary of visits from previous day
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const start = new Date(end);
  start.setDate(end.getDate() - 1);
  const snapshot = await db.collection('visits').where('startTime', '>=', admin.firestore.Timestamp.fromDate(start)).where('startTime', '<', admin.firestore.Timestamp.fromDate(end)).get();
  let totalRevenue = 0;
  const serviceUsage = {};
  snapshot.forEach(docSnap => {
    const v = docSnap.data();
    totalRevenue += v.total || 0;
    v.serviceItems.forEach(item => {
      serviceUsage[item.serviceId] = (serviceUsage[item.serviceId] || 0) + item.quantity;
    });
  });
  // Compose report message
  let message = `Daily Report for ${start.toDateString()}\nTotal Revenue: ${totalRevenue.toFixed(2)}\nService Usage:\n`;
  Object.keys(serviceUsage).forEach(id => {
    message += ` - ${id}: ${serviceUsage[id]}\n`;
  });
  // TODO: send this report to admins via email or messaging
  console.log(message);
  return null;
});
