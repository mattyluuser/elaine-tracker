const STORAGE_KEY = "elaine-bothersome-log";
const PST_TIME_ZONE = "America/Los_Angeles";

const countEl = document.getElementById("count");
const logListEl = document.getElementById("log-list");
const botherBtn = document.getElementById("bother-btn");
const undoBtn = document.getElementById("undo-btn");

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

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

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

  [...entries].reverse().forEach((iso) => {
    const d = new Date(iso);
    const li = document.createElement("li");

    const dateSpan = document.createElement("span");
    dateSpan.className = "entry-date";
    dateSpan.textContent = dateFormatter.format(d);

    const timeSpan = document.createElement("span");
    timeSpan.className = "entry-time";
    timeSpan.textContent = timeFormatter.format(d);

    li.appendChild(dateSpan);
    li.appendChild(timeSpan);
    logListEl.appendChild(li);
  });
}

function logBothersome() {
  const entries = loadEntries();
  entries.push(new Date().toISOString());
  saveEntries(entries);
  render(entries);
}

function undoLast() {
  const entries = loadEntries();
  entries.pop();
  saveEntries(entries);
  render(entries);
}

botherBtn.addEventListener("click", logBothersome);
undoBtn.addEventListener("click", undoLast);

render(loadEntries());
