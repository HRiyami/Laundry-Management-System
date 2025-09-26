// main.js
// This file implements the core logic for the Laundry Management System.

import { db, functions } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js';

// ======== Global State ========
let currentLanguage = 'en';
let customers = [];
let services = [];
let visits = [];
let currentInvoiceVisit = null;

// ======== Translation dictionary ========
// Provide translations for UI labels. Extend as needed.
const translations = {
  en: {
    navCustomers: 'Customers',
    navServices: 'Services',
    navVisits: 'Visits',
    navReports: 'Reports',
    customersHeader: 'Customer Management',
    servicesHeader: 'Service Management',
    visitsHeader: 'Visit Management',
    reportsHeader: 'Reports',
    btnAddCustomer: 'Add Customer',
    btnEdit: 'Edit',
    btnNewVisitSmall: 'New Visit',
    btnMarkReady: 'Ready',
    btnMarkDelivered: 'Delivered',
    btnViewInvoice: 'Invoice',
    btnAddService: 'Add Service',
    btnNewVisit: 'New Visit',
    thName: 'Name',
    thPhone: 'Phone',
    thActions: 'Actions',
    thServiceName: 'Service Name',
    thPrice: 'Price',
    thCustomer: 'Customer',
    thServices: 'Services',
    thStatus: 'Status',
    thDates: 'Dates',
    modalAddCustomer: 'Add Customer',
    modalEditCustomer: 'Edit Customer',
    modalAddService: 'Add Service',
    modalEditService: 'Edit Service',
    modalNewVisit: 'New Visit',
    modalInvoice: 'Invoice',
    labelName: 'Name',
    labelPhone: 'Phone',
    labelServiceName: 'Service Name',
    labelPrice: 'Price',
    labelCustomer: 'Customer',
    labelServices: 'Services',
    labelDiscount: 'Discount (%)',
    labelUrgentMultiplier: 'Urgent Multiplier',
    labelVAT: 'VAT (%)',
    btnSave: 'Save',
    btnSaveVisit: 'Save Visit',
    btnPrint: 'Print',
    btnSend: 'Send',
    reportDaily: 'Daily',
    reportWeekly: 'Weekly',
    reportMonthly: 'Monthly',
    reportYearly: 'Yearly',
    btnGenerateReport: 'Generate',
    thServiceUsage: 'Service Usage',
    thRevenue: 'Revenue',
    statusReceived: 'Received',
    statusReady: 'Ready',
    statusDelivered: 'Delivered',
    btnMarkReady: 'Mark Ready',
    btnMarkDelivered: 'Mark Delivered',
    btnViewInvoice: 'Invoice',
    invoiceTitle: 'Invoice',
    invoiceCustomer: 'Customer',
    invoiceDate: 'Date',
    invoiceItems: 'Items',
    invoiceSubtotal: 'Subtotal',
    invoiceDiscount: 'Discount',
    invoiceVAT: 'VAT',
    invoiceTotal: 'Total'
  },
  ar: {
    navCustomers: 'العملاء',
    navServices: 'الخدمات',
    navVisits: 'الزيارات',
    navReports: 'التقارير',
    customersHeader: 'إدارة العملاء',
    servicesHeader: 'إدارة الخدمات',
    visitsHeader: 'إدارة الزيارات',
    reportsHeader: 'التقارير',
    btnAddCustomer: 'إضافة عميل',
    btnEdit: 'تعديل',
    btnNewVisitSmall: 'زيارة جديدة',
    btnMarkReady: 'جاهز',
    btnMarkDelivered: 'تم التسليم',
    btnViewInvoice: 'فاتورة',
    btnAddService: 'إضافة خدمة',
    btnNewVisit: 'زيارة جديدة',
    thName: 'الاسم',
    thPhone: 'الهاتف',
    thActions: 'الإجراءات',
    thServiceName: 'اسم الخدمة',
    thPrice: 'السعر',
    thCustomer: 'العميل',
    thServices: 'الخدمات',
    thStatus: 'الحالة',
    thDates: 'التواريخ',
    modalAddCustomer: 'إضافة عميل',
    modalEditCustomer: 'تعديل عميل',
    modalAddService: 'إضافة خدمة',
    modalEditService: 'تعديل خدمة',
    modalNewVisit: 'زيارة جديدة',
    modalInvoice: 'فاتورة',
    labelName: 'الاسم',
    labelPhone: 'الهاتف',
    labelServiceName: 'اسم الخدمة',
    labelPrice: 'السعر',
    labelCustomer: 'العميل',
    labelServices: 'الخدمات',
    labelDiscount: 'الخصم (%)',
    labelUrgentMultiplier: 'معامل الاستعجال',
    labelVAT: 'الضريبة (%)',
    btnSave: 'حفظ',
    btnSaveVisit: 'حفظ الزيارة',
    btnPrint: 'طباعة',
    btnSend: 'إرسال',
    reportDaily: 'يومي',
    reportWeekly: 'أسبوعي',
    reportMonthly: 'شهري',
    reportYearly: 'سنوي',
    btnGenerateReport: 'إنشاء التقرير',
    thServiceUsage: 'استخدام الخدمة',
    thRevenue: 'الإيرادات',
    statusReceived: 'تم الاستلام',
    statusReady: 'جاهز',
    statusDelivered: 'تم التسليم',
    btnMarkReady: 'تحديد كجاهز',
    btnMarkDelivered: 'تحديد كتسليم',
    btnViewInvoice: 'فاتورة',
    invoiceTitle: 'فاتورة',
    invoiceCustomer: 'العميل',
    invoiceDate: 'التاريخ',
    invoiceItems: 'العناصر',
    invoiceSubtotal: 'المجموع الفرعي',
    invoiceDiscount: 'الخصم',
    invoiceVAT: 'الضريبة',
    invoiceTotal: 'الإجمالي'
  }
};

// ======== Utility Functions ========
function translatePage() {
  // Set UI text based on currentLanguage
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      el.textContent = translations[currentLanguage][key];
    }
  });
  document.getElementById('currentLang').textContent = currentLanguage.toUpperCase();
}

// Set chosen language and store in localStorage
window.setLanguage = function(lang) {
  currentLanguage = lang;
  localStorage.setItem('lmsLang', lang);
  translatePage();
};

// Format timestamp to local date/time string
function formatTimestamp(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('default', { hour12: false });
}

// ======== Initialization ========
document.addEventListener('DOMContentLoaded', async () => {
  // Load language preference
  const lang = localStorage.getItem('lmsLang') || 'en';
  currentLanguage = lang;
  translatePage();

  // Set nav event listeners
  document.getElementById('nav-customers').addEventListener('click', () => showSection('customers'));
  document.getElementById('nav-services').addEventListener('click', () => showSection('services'));
  document.getElementById('nav-visits').addEventListener('click', () => showSection('visits'));
  document.getElementById('nav-reports').addEventListener('click', () => showSection('reports'));

  // Form submit handlers
  document.getElementById('customerForm').addEventListener('submit', saveCustomer);
  document.getElementById('serviceForm').addEventListener('submit', saveService);
  document.getElementById('visitForm').addEventListener('submit', saveVisit);

  // Initial fetch of data
  await fetchCustomers();
  await fetchServices();
  await fetchVisits();
});

// ======== Section Navigation ========
function showSection(section) {
  // Hide all sections and remove active class from nav items
  ['customers', 'services', 'visits', 'reports'].forEach(s => {
    document.getElementById(`section-${s}`).classList.add('d-none');
    document.getElementById(`nav-${s}`).classList.remove('active');
  });
  // Show selected section and activate nav item
  document.getElementById(`section-${section}`).classList.remove('d-none');
  document.getElementById(`nav-${section}`).classList.add('active');

  if (section === 'reports') {
    // Auto generate report on entering the reports section
    generateReport();
  }
}

// ======== Customer Functions ========
async function fetchCustomers() {
  const snapshot = await getDocs(collection(db, 'customers'));
  customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderCustomersTable(customers);
}

function renderCustomersTable(data) {
  const tbody = document.getElementById('customersTableBody');
  tbody.innerHTML = '';
  data.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.phone}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" onclick="editCustomer('${c.id}')" data-lang="btnEdit">Edit</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="openNewVisit('${c.id}')" data-lang="btnNewVisitSmall">New Visit</button>
      </td>`;
    tbody.appendChild(tr);
  });
  translatePage();
}

window.showCustomerForm = function() {
  // Reset form
  document.getElementById('customerForm').reset();
  document.getElementById('customerId').value = '';
  document.getElementById('customerModalTitle').setAttribute('data-lang', 'modalAddCustomer');
  translatePage();
  new bootstrap.Modal(document.getElementById('customerModal')).show();
};

window.editCustomer = function(id) {
  const cust = customers.find(c => c.id === id);
  if (!cust) return;
  document.getElementById('customerName').value = cust.name;
  document.getElementById('customerPhone').value = cust.phone;
  document.getElementById('customerId').value = id;
  document.getElementById('customerModalTitle').setAttribute('data-lang', 'modalEditCustomer');
  translatePage();
  new bootstrap.Modal(document.getElementById('customerModal')).show();
};

async function saveCustomer(event) {
  event.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const id = document.getElementById('customerId').value;
  if (!name || !phone) return;
  if (id) {
    // Update existing
    await updateDoc(doc(db, 'customers', id), { name, phone });
    await logActivity('customerUpdated', `Customer ${name} updated`);
  } else {
    // Add new
    await addDoc(collection(db, 'customers'), { name, phone, createdAt: serverTimestamp() });
    await logActivity('customerAdded', `Customer ${name} added`);
  }
  bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
  await fetchCustomers();
}

window.searchCustomers = function() {
  const q = document.getElementById('searchCustomerInput').value.toLowerCase();
  const filtered = customers.filter(c =>
    c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
  );
  renderCustomersTable(filtered);
};

// ======== Service Functions ========
async function fetchServices() {
  const snapshot = await getDocs(collection(db, 'services'));
  services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderServicesTable(services);
}

function renderServicesTable(data) {
  const tbody = document.getElementById('servicesTableBody');
  tbody.innerHTML = '';
  data.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.price.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" onclick="editService('${s.id}')" data-lang="btnEdit">Edit</button>
      </td>`;
    tbody.appendChild(tr);
  });
  translatePage();
}

window.showServiceForm = function() {
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
  document.getElementById('serviceModalTitle').setAttribute('data-lang', 'modalAddService');
  translatePage();
  new bootstrap.Modal(document.getElementById('serviceModal')).show();
};

window.editService = function(id) {
  const srv = services.find(s => s.id === id);
  if (!srv) return;
  document.getElementById('serviceName').value = srv.name;
  document.getElementById('servicePrice').value = srv.price;
  document.getElementById('serviceId').value = id;
  document.getElementById('serviceModalTitle').setAttribute('data-lang', 'modalEditService');
  translatePage();
  new bootstrap.Modal(document.getElementById('serviceModal')).show();
};

async function saveService(event) {
  event.preventDefault();
  const name = document.getElementById('serviceName').value.trim();
  const price = parseFloat(document.getElementById('servicePrice').value);
  const id = document.getElementById('serviceId').value;
  if (!name || isNaN(price)) return;
  if (id) {
    await updateDoc(doc(db, 'services', id), { name, price });
    await logActivity('serviceUpdated', `Service ${name} updated`);
  } else {
    await addDoc(collection(db, 'services'), { name, price, createdAt: serverTimestamp() });
    await logActivity('serviceAdded', `Service ${name} added`);
  }
  bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
  await fetchServices();
  // Update services list in visit form if it's open
  populateVisitServicesList();
}

window.searchServices = function() {
  const q = document.getElementById('searchServiceInput').value.toLowerCase();
  const filtered = services.filter(s =>
    s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );
  renderServicesTable(filtered);
};

// ======== Visit Functions ========
async function fetchVisits() {
  const snapshot = await getDocs(collection(db, 'visits'));
  visits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderVisitsTable(visits);
}

function renderVisitsTable(data) {
  const tbody = document.getElementById('visitsTableBody');
  tbody.innerHTML = '';
  data.forEach(v => {
    const customer = customers.find(c => c.id === v.customerId);
    const customerName = customer ? customer.name : v.customerId;
    // Compose services string
    const servicesStr = v.serviceItems.map(item => {
      const s = services.find(sv => sv.id === item.serviceId);
      const name = s ? s.name : item.serviceId;
      return `${name} (x${item.quantity})`;
    }).join(', ');
    const statusLabel = translations[currentLanguage][`status${v.status}`] || v.status;
    const datesStr = `${formatTimestamp(v.startTime)} / ${formatTimestamp(v.readyTime)} / ${formatTimestamp(v.deliveredTime)}`;
    let statusActions = '';
    if (v.status === 'Received') {
      statusActions = `<button class="btn btn-sm btn-outline-success me-1" onclick="markVisitReady('${v.id}')" data-lang="btnMarkReady">Ready</button>`;
    } else if (v.status === 'Ready') {
      statusActions = `<button class="btn btn-sm btn-outline-success me-1" onclick="markVisitDelivered('${v.id}')" data-lang="btnMarkDelivered">Delivered</button>`;
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.id}</td>
      <td>${customerName}</td>
      <td>${servicesStr}</td>
      <td>${statusLabel}</td>
      <td>${datesStr}</td>
      <td>
        ${statusActions}
        <button class="btn btn-sm btn-outline-primary" onclick="viewInvoice('${v.id}')" data-lang="btnViewInvoice">Invoice</button>
      </td>`;
    tbody.appendChild(tr);
  });
  translatePage();
}

window.showVisitForm = function() {
  document.getElementById('visitForm').reset();
  // Populate customer select
  const select = document.getElementById('visitCustomer');
  select.innerHTML = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  // Populate services list
  populateVisitServicesList();
  document.getElementById('visitModalTitle').setAttribute('data-lang', 'modalNewVisit');
  translatePage();
  new bootstrap.Modal(document.getElementById('visitModal')).show();
};

function populateVisitServicesList() {
  const container = document.getElementById('visitServicesList');
  container.innerHTML = '';
  services.forEach(s => {
    const div = document.createElement('div');
    div.classList.add('form-check', 'mb-1');
    div.innerHTML = `
      <input class="form-check-input" type="checkbox" value="${s.id}" id="serviceCheckbox-${s.id}" onclick="toggleQuantity('${s.id}')">
      <label class="form-check-label" for="serviceCheckbox-${s.id}">${s.name} (${s.price.toFixed(2)})</label>
      <input type="number" id="quantity-${s.id}" class="form-control form-control-sm d-none mt-1" min="1" value="1" style="width: 100px;">
    `;
    container.appendChild(div);
  });
}

window.toggleQuantity = function(serviceId) {
  const qtyInput = document.getElementById(`quantity-${serviceId}`);
  const checkbox = document.getElementById(`serviceCheckbox-${serviceId}`);
  if (checkbox.checked) {
    qtyInput.classList.remove('d-none');
  } else {
    qtyInput.classList.add('d-none');
  }
};

async function saveVisit(event) {
  event.preventDefault();
  const customerId = document.getElementById('visitCustomer').value;
  const discount = parseFloat(document.getElementById('visitDiscount').value) || 0;
  const urgentMultiplier = parseFloat(document.getElementById('visitUrgentMultiplier').value) || 1;
  const vat = parseFloat(document.getElementById('visitVAT').value) || 0;
  const selectedServiceItems = [];
  services.forEach(s => {
    const checkbox = document.getElementById(`serviceCheckbox-${s.id}`);
    if (checkbox && checkbox.checked) {
      const qty = parseInt(document.getElementById(`quantity-${s.id}`).value) || 1;
      selectedServiceItems.push({ serviceId: s.id, quantity: qty, price: s.price });
    }
  });
  if (!customerId || selectedServiceItems.length === 0) {
    alert('Please select customer and at least one service.');
    return;
  }
  // Compute total
  const subtotal = selectedServiceItems.reduce((sum, item) => sum + item.price * item.quantity * urgentMultiplier, 0);
  const discountAmount = subtotal * (discount / 100);
  const vatAmount = (subtotal - discountAmount) * (vat / 100);
  const total = subtotal - discountAmount + vatAmount;
  // Prepare data
  const visitData = {
    customerId,
    serviceItems: selectedServiceItems,
    discount,
    urgentMultiplier,
    vat,
    total,
    status: 'Received',
    startTime: serverTimestamp(),
    readyTime: null,
    deliveredTime: null
  };
  const docRef = await addDoc(collection(db, 'visits'), visitData);
  // Generate invoice HTML and save as field on doc
  const invoiceHtml = generateInvoiceHtml({ id: docRef.id, ...visitData });
  await updateDoc(doc(db, 'visits', docRef.id), { invoiceHtml });
  await logActivity('visitCreated', `Visit ${docRef.id} created`);
  bootstrap.Modal.getInstance(document.getElementById('visitModal')).hide();
  await fetchVisits();
  // Optionally open invoice modal right away
  viewInvoice(docRef.id);
}

window.openNewVisit = function(customerId) {
  showSection('visits');
  showVisitForm();
  document.getElementById('visitCustomer').value = customerId;
};

// Update status functions
window.markVisitReady = async function(id) {
  const visitRef = doc(db, 'visits', id);
  await updateDoc(visitRef, { status: 'Ready', readyTime: serverTimestamp() });
  await logActivity('visitStatus', `Visit ${id} marked Ready`);
  await fetchVisits();
  const visit = visits.find(v => v.id === id);
  await notifyCustomer(visit, 'ready');
};

window.markVisitDelivered = async function(id) {
  const visitRef = doc(db, 'visits', id);
  await updateDoc(visitRef, { status: 'Delivered', deliveredTime: serverTimestamp() });
  await logActivity('visitStatus', `Visit ${id} marked Delivered`);
  await fetchVisits();
  const visit = visits.find(v => v.id === id);
  await notifyCustomer(visit, 'delivered');
};

// ======== Invoice Functions ========
function generateInvoiceHtml(visit) {
  const customer = customers.find(c => c.id === visit.customerId);
  const serviceRows = visit.serviceItems.map(item => {
    const service = services.find(s => s.id === item.serviceId);
    const name = service ? service.name : item.serviceId;
    const unitPrice = (item.price * visit.urgentMultiplier).toFixed(2);
    const lineTotal = (item.price * item.quantity * visit.urgentMultiplier).toFixed(2);
    return `<tr><td>${name}</td><td>${item.quantity}</td><td>${unitPrice}</td><td>${lineTotal}</td></tr>`;
  }).join('');
  const subtotal = visit.serviceItems.reduce((sum, item) => sum + item.price * item.quantity * visit.urgentMultiplier, 0);
  const discountAmount = subtotal * (visit.discount / 100);
  const vatAmount = (subtotal - discountAmount) * (visit.vat / 100);
  const total = subtotal - discountAmount + vatAmount;
  const currency = 'OMR'; // Oman Riyal; adjust as needed
  return `
    <h4>${translations[currentLanguage].invoiceTitle} #${visit.id}</h4>
    <p><strong>${translations[currentLanguage].invoiceCustomer}:</strong> ${customer ? customer.name : visit.customerId}</p>
    <p><strong>${translations[currentLanguage].invoiceDate}:</strong> ${new Date().toLocaleDateString()}</p>
    <table class="invoice-table">
      <thead><tr><th>${translations[currentLanguage].thServiceName}</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
      <tbody>
        ${serviceRows}
      </tbody>
    </table>
    <p class="invoice-total">${translations[currentLanguage].invoiceSubtotal}: ${subtotal.toFixed(2)} ${currency}</p>
    <p class="invoice-total">${translations[currentLanguage].invoiceDiscount} (${visit.discount}%): -${discountAmount.toFixed(2)} ${currency}</p>
    <p class="invoice-total">${translations[currentLanguage].invoiceVAT} (${visit.vat}%): +${vatAmount.toFixed(2)} ${currency}</p>
    <p class="invoice-total">${translations[currentLanguage].invoiceTotal}: ${total.toFixed(2)} ${currency}</p>
  `;
}

window.viewInvoice = function(visitId) {
  const visit = visits.find(v => v.id === visitId);
  if (!visit) return;
  currentInvoiceVisit = visit;
  let html = visit.invoiceHtml;
  if (!html) {
    html = generateInvoiceHtml(visit);
  }
  document.getElementById('invoiceContent').innerHTML = html;
  translatePage();
  new bootstrap.Modal(document.getElementById('invoiceModal')).show();
};

window.sendInvoice = async function() {
  if (!currentInvoiceVisit) return;
  try {
    // Attempt to call cloud function to send invoice
    const sendInvoiceFn = httpsCallable(functions, 'sendInvoice');
    const result = await sendInvoiceFn({ visitId: currentInvoiceVisit.id });
    alert(result.data.message || 'Invoice sent');
    await logActivity('invoiceSent', `Invoice for visit ${currentInvoiceVisit.id} sent`);
  } catch (err) {
    console.error(err);
    alert('Failed to send invoice. Please ensure the cloud function is deployed and configured correctly.');
  }
};

// ======== Report Functions ========
window.generateReport = async function() {
  const type = document.getElementById('reportType').value;
  const startDateInput = document.getElementById('reportStartDate').value;
  const endDateInput = document.getElementById('reportEndDate').value;
  let startDate, endDate;
  const now = new Date();
  if (startDateInput && endDateInput) {
    startDate = new Date(startDateInput);
    endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Determine default date range based on report type
    switch (type) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'weekly':
        // Start from last 7 days
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(0);
        endDate = now;
    }
  }
  // Filter visits by date range
  const filteredVisits = visits.filter(v => {
    if (!v.startTime) return false;
    const start = v.startTime.toDate ? v.startTime.toDate() : new Date(v.startTime);
    return start >= startDate && start <= endDate;
  });
  // Compute revenue and service usage
  let totalRevenue = 0;
  const serviceUsage = {};
  filteredVisits.forEach(v => {
    totalRevenue += v.total || 0;
    v.serviceItems.forEach(item => {
      serviceUsage[item.serviceId] = (serviceUsage[item.serviceId] || 0) + item.quantity;
    });
  });
  // Build report HTML
  let html = `<p><strong>From:</strong> ${startDate.toLocaleDateString()} <strong>To:</strong> ${endDate.toLocaleDateString()}</p>`;
  html += `<p><strong>${translations[currentLanguage].thRevenue}:</strong> ${totalRevenue.toFixed(2)}</p>`;
  html += `<table class="table table-striped"><thead><tr><th>${translations[currentLanguage].thServiceName}</th><th>${translations[currentLanguage].thServiceUsage}</th></tr></thead><tbody>`;
  Object.keys(serviceUsage).forEach(serviceId => {
    const srv = services.find(s => s.id === serviceId);
    const name = srv ? srv.name : serviceId;
    html += `<tr><td>${name}</td><td>${serviceUsage[serviceId]}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('reportContent').innerHTML = html;
  translatePage();
};

// ======== Activity Log ========
async function logActivity(type, message) {
  // Adds a record to the activity collection
  try {
    await addDoc(collection(db, 'activities'), { type, message, timestamp: serverTimestamp() });
  } catch (err) {
    console.warn('Failed to log activity', err);
  }
}

// ======== Notifications ========
async function notifyCustomer(visit, status) {
  // Sends a notification to the customer via cloud function
  try {
    const notifyFn = httpsCallable(functions, 'notifyCustomer');
    const res = await notifyFn({ visitId: visit.id, status });
    console.log(res.data);
  } catch (err) {
    console.warn('Notification failed', err);
  }
}