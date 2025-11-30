// FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// CONFIG (PUT YOURS HERE)
const firebaseConfig = {
  apiKey: "AIzaSyATGKgMSYMWfU0afbY__osMqCaG-8EKv4Y",
  authDomain: "smart-irrigation-3826a.firebaseapp.com",
  databaseURL: "https://smart-irrigation-3826a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-irrigation-3826a",
  storageBucket: "smart-irrigation-3826a.appspot.com",
  messagingSenderId: "299755599351",
  appId: "1:299755599351:web:268f0a9710a4b3a528eaf2"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase();

const page = window.location.pathname;

/* -------------------------------
   DASHBOARD (index.html)
--------------------------------*/
if (page.includes("index")) {
  const id = (x) => document.getElementById(x);

  onValue(
    ref(db, "live/moisture/A"),
    (s) => (id("moistA").innerHTML = s.val())
  );
  onValue(
    ref(db, "live/moisture/B"),
    (s) => (id("moistB").innerHTML = s.val())
  );
  onValue(ref(db, "live/pump/A"), (s) => (id("pumpA").innerHTML = s.val()));
  onValue(ref(db, "live/pump/B"), (s) => (id("pumpB").innerHTML = s.val()));
  onValue(ref(db, "live/mode"), (s) => (id("modeText").innerHTML = s.val()));

  onValue(
    ref(db, "settings/threshold/A"),
    (s) => (id("thA").innerHTML = s.val())
  );
  onValue(
    ref(db, "settings/threshold/B"),
    (s) => (id("thB").innerHTML = s.val())
  );

  window.setMode = (mode) => set(ref(db, "live/mode"), mode);
  window.setPumpA = (state) => set(ref(db, "manual/pumpA"), state);
  window.setPumpB = (state) => set(ref(db, "manual/pumpB"), state);
}

/* -------------------------------
   ANALYTICS (logs_charts.html)
--------------------------------*/
if (page.includes("logs_charts")) {
  // WIDGETS
  onValue(
    ref(db, "live/moisture/A"),
    (s) => (document.getElementById("widgetMoistA").innerHTML = s.val())
  );
  onValue(
    ref(db, "live/moisture/B"),
    (s) => (document.getElementById("widgetMoistB").innerHTML = s.val())
  );
  onValue(
    ref(db, "live/pump/A"),
    (s) => (document.getElementById("widgetPumpA").innerHTML = s.val())
  );
  onValue(
    ref(db, "live/pump/B"),
    (s) => (document.getElementById("widgetPumpB").innerHTML = s.val())
  );

  // CHARTS
  const moistCtx = document.getElementById("moistChart");
  const pumpCtx = document.getElementById("pumpChart");

  const moistChart = new Chart(moistCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Moisture A", borderColor: "#007bff", data: [], tension: 0.4 },
        { label: "Moisture B", borderColor: "#28a745", data: [], tension: 0.4 },
      ],
    },
  });

  const pumpChart = new Chart(pumpCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "Pump A", backgroundColor: "#673ab7", data: [] },
        { label: "Pump B", backgroundColor: "#ff9800", data: [] },
      ],
    },
  });

  // UPDATE CHARTS
  onValue(ref(db, "live/moisture"), (s) => {
    const A = s.val().A;
    const B = s.val().B;

    moistChart.data.labels.push(new Date().toLocaleTimeString());
    moistChart.data.datasets[0].data.push(A);
    moistChart.data.datasets[1].data.push(B);

    moistChart.update();
  });

  onValue(ref(db, "live/pump"), (s) => {
    const A = s.val().A === "ON" ? 1 : 0;
    const B = s.val().B === "ON" ? 1 : 0;

    pumpChart.data.labels.push(new Date().toLocaleTimeString());
    pumpChart.data.datasets[0].data.push(A);
    pumpChart.data.datasets[1].data.push(B);

    pumpChart.update();
  });

  // LOGS
  onValue(ref(db, "logs"), (snapshot) => {
    const logList = document.getElementById("logList");
    logList.innerHTML = "";

    snapshot.forEach((item) => {
      const data = item.val();
      const li = document.createElement("li");

      li.textContent = `${new Date(Number(item.key)).toLocaleString()} → ${
        data.event
      }: ${data.value}`;

      logList.appendChild(li);
    });
  });
}

