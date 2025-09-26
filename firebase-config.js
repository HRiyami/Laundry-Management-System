<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDyMqHIQLV8h4KCAM0wCnyVSO6oMm5pOyw",
    authDomain: "laundry-management-syste-b9141.firebaseapp.com",
    projectId: "laundry-management-syste-b9141",
    storageBucket: "laundry-management-syste-b9141.firebasestorage.app",
    messagingSenderId: "995634723047",
    appId: "1:995634723047:web:d0696025acdf6857080a42",
    measurementId: "G-749F0ECMJG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
