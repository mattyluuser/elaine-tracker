const STORAGE_KEY = "elaine-bothersome-log";
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

function logBothersome() {
  const name = nameInput.value.trim();
  if (!name) return;

  const entries = loadEntries();
  entries.push({ name, timestamp: new Date().toISOString() });
  saveEntries(entries);
  render(entries);

  localStorage.setItem(LAST_NAME_KEY, name);
}

function undoLast() {
  const entries = loadEntries();
  entries.pop();
  saveEntries(entries);
  render(entries);
}

nameInput.addEventListener("input", updateButtonState);
botherBtn.addEventListener("click", logBothersome);
undoBtn.addEventListener("click", undoLast);

nameInput.value = localStorage.getItem(LAST_NAME_KEY) || "";
updateButtonState();
render(loadEntries());
