import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
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
const CUTOUT_SRC = "assets/elaine-cutout.png";
const FLOOD_COUNT = 12;
const TOAST_DURATION_MS = 3000;

const SNARKY_REMARKS = [
  "Given her history, it is not surprising.",
  "There she goes again.",
  "Shocking absolutely no one.",
  "And the streak continues.",
  "Another day, another entry for the file.",
  "Consistency is her one virtue, apparently.",
  "Add it to the tab.",
  "Truly a masterclass in repetition.",
  "The pattern holds strong.",
  "Some things never change — case in point.",
  "Right on schedule.",
  "Bold of her to keep this up.",
  "The data doesn't lie.",
  "Iconic behavior, as always.",
  "Somewhere, a trend line just got steeper.",
  "Groundbreaking. Truly.",
  "This one's going straight to the highlight reel.",
  "Peak form today.",
  "History repeats itself — loudly.",
  "Noted. Filed. Unsurprised.",
];

const countEl = document.getElementById("count");
const daysSinceEl = document.getElementById("days-since");
const logListEl = document.getElementById("log-list");
const botherBtn = document.getElementById("bother-btn");
const nameInput = document.getElementById("reporter-name");
const descriptionInput = document.getElementById("reporter-description");
const remarkToastEl = document.getElementById("remark-toast");
const floodLayerEl = document.getElementById("flood-layer");
const zoomBtn = document.getElementById("zoom-btn");
const lightboxEl = document.getElementById("lightbox");
const lightboxCloseBtn = document.getElementById("lightbox-close");

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

const pstDateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function pstDayIndex(date) {
  const [year, month, day] = pstDateKeyFormatter.format(date).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

let lastEntryTimestamp = null;

function updateDaysSince() {
  if (!lastEntryTimestamp) {
    daysSinceEl.textContent = "—";
    return;
  }
  daysSinceEl.textContent = pstDayIndex(new Date()) - pstDayIndex(new Date(lastEntryTimestamp));
}

function pickRemark() {
  return SNARKY_REMARKS[Math.floor(Math.random() * SNARKY_REMARKS.length)];
}

function render(entries) {
  countEl.textContent = entries.length;

  lastEntryTimestamp = entries.length ? entries[entries.length - 1].timestamp : null;
  updateDaysSince();

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

    if (entry.description) {
      const descP = document.createElement("p");
      descP.className = "entry-description";
      descP.textContent = entry.description;
      li.appendChild(descP);
    }

    if (entry.remark) {
      const remarkP = document.createElement("p");
      remarkP.className = "entry-remark";
      remarkP.textContent = entry.remark;
      li.appendChild(remarkP);
    }

    logListEl.appendChild(li);
  });
}

function updateButtonState() {
  botherBtn.disabled = nameInput.value.trim().length === 0;
}

async function logBothersome() {
  const name = nameInput.value.trim();
  if (!name) return;

  const description = descriptionInput.value.trim();
  const remark = pickRemark();

  await addDoc(entriesCol, {
    name,
    description,
    remark,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem(LAST_NAME_KEY, name);
  descriptionInput.value = "";
}

let toastTimeoutId;

function showRemarkToast(remark) {
  if (!remark) return;
  clearTimeout(toastTimeoutId);
  remarkToastEl.textContent = remark;
  remarkToastEl.classList.add("visible");
  toastTimeoutId = setTimeout(() => {
    remarkToastEl.classList.remove("visible");
  }, TOAST_DURATION_MS);
}

function floodCutouts() {
  for (let i = 0; i < FLOOD_COUNT; i++) {
    const img = document.createElement("img");
    img.src = CUTOUT_SRC;
    img.alt = "";
    img.className = "float-cutout";

    const left = Math.random() * 90;
    const duration = 3.5 + Math.random() * 2.5;
    const delay = Math.random() * 0.8;
    const scale = 0.6 + Math.random() * 0.7;

    img.style.left = `${left}vw`;
    img.style.animationDuration = `${duration}s`;
    img.style.animationDelay = `${delay}s`;
    img.style.setProperty("--scale", scale);
    img.addEventListener("animationend", () => img.remove());

    floodLayerEl.appendChild(img);
  }
}

function openLightbox() {
  lightboxEl.hidden = false;
}

function closeLightbox() {
  lightboxEl.hidden = true;
}

nameInput.addEventListener("input", updateButtonState);
botherBtn.addEventListener("click", logBothersome);
zoomBtn.addEventListener("click", openLightbox);
lightboxCloseBtn.addEventListener("click", closeLightbox);
lightboxEl.addEventListener("click", (event) => {
  if (event.target === lightboxEl) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightboxEl.hidden) closeLightbox();
});

nameInput.value = localStorage.getItem(LAST_NAME_KEY) || "";
updateButtonState();
setInterval(updateDaysSince, 60 * 60 * 1000);

let isFirstSnapshot = true;

const liveQuery = query(entriesCol, orderBy("timestamp"));
onSnapshot(liveQuery, (snapshot) => {
  render(snapshot.docs.map((docSnap) => docSnap.data()));

  if (isFirstSnapshot) {
    isFirstSnapshot = false;
    return;
  }

  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const entry = change.doc.data();
      floodCutouts();
      showRemarkToast(entry.remark);
    }
  });
});
