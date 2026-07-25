import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWAsgTuJDHrAk8NlftzSdGcaOlv303cVs",
  authDomain: "elaine-s-bothersome-tracker.firebaseapp.com",
  projectId: "elaine-s-bothersome-tracker",
  storageBucket: "elaine-s-bothersome-tracker.firebasestorage.app",
  messagingSenderId: "737817239811",
  appId: "1:737817239811:web:c21c69c6e0a6fe67c84936",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const entriesCol = collection(db, "bothersomes");

const LAST_NAME_KEY = "elaine-bothersome-last-name";
const PST_TIME_ZONE = "America/Los_Angeles";

const countEl = document.getElementById("count");
const logListEl = document.getElementById("log-list");
const botherBtn = document.getElementById("bother-btn");
const undoBtn = document.getElementById("undo-btn");
const nameInput = document.getElementById("reporter-name");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: PST_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZoneName: "short",
});

function render(entries) {
  countEl.textContent = entries.length;
  logListEl.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "log-empty";
    empty.textContent = "No bothersomes logged yet.";
    logListEl.appendChild(empty);
    return;
  }

  [...entries].reverse().forEach((entry) => {
    const d = new Date(entry.timestamp);
    const li = document.createElement("li");

    const top = document.createElement("div");
    top.className = "entry-top";

    const nameSpan = document.createElement("span");
    nameSpan.className = "entry-name";
    nameSpan.textContent = entry.name;

    const timeSpan = document.createElement("span");
    timeSpan.className = "entry-time";
    timeSpan.textContent = timeFormatter.format(d);

    top.appendChild(nameSpan);
    top.appendChild(timeSpan);

    const dateSpan = document.createElement("span");
    dateSpan.className = "entry-date";
    dateSpan.textContent = dateFormatter.format(d);

    li.appendChild(top);
    li.appendChild(dateSpan);
    logListEl.appendChild(li);
  });
}

function updateButtonState() {
  botherBtn.disabled = nameInput.value.trim().length === 0;
}

async function logBothersome() {
  const name = nameInput.value.trim();
  if (!name) return;

  await addDoc(entriesCol, { name, timestamp: new Date().toISOString() });
  localStorage.setItem(LAST_NAME_KEY, name);
}

async function undoLast() {
  const q = query(entriesCol, orderBy("timestamp", "desc"), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  await deleteDoc(doc(db, "bothersomes", snapshot.docs[0].id));
}

nameInput.addEventListener("input", updateButtonState);
botherBtn.addEventListener("click", logBothersome);
undoBtn.addEventListener("click", undoLast);

nameInput.value = localStorage.getItem(LAST_NAME_KEY) || "";
updateButtonState();

const liveQuery = query(entriesCol, orderBy("timestamp"));
onSnapshot(liveQuery, (snapshot) => {
  render(snapshot.docs.map((docSnap) => docSnap.data()));
});
