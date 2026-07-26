const BREED_IMAGES_URL = "https://dog.ceo/api/breed/chow/images";
const LIKED_KEY = "christy-chow-chow-gallery-liked";

const frameEl = document.getElementById("frame");
const photoEl = document.getElementById("photo");
const statusEl = document.getElementById("status");
const likeBtn = document.getElementById("like-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const counterEl = document.getElementById("counter");
const likedCountEl = document.getElementById("liked-count");

let photos = [];
let index = 0;
let liked = new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"));

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function saveLiked() {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
}

function updateLikedCount() {
  likedCountEl.textContent = liked.size > 0
    ? `You've liked ${liked.size} chow chow${liked.size === 1 ? "" : "s"}`
    : "";
}

function render() {
  if (photos.length === 0) return;

  const url = photos[index];
  photoEl.src = url;
  photoEl.hidden = false;
  statusEl.hidden = true;

  const isLiked = liked.has(url);
  likeBtn.classList.toggle("liked", isLiked);
  likeBtn.setAttribute("aria-pressed", String(isLiked));

  counterEl.textContent = `${index + 1} / ${photos.length}`;
  prevBtn.disabled = photos.length <= 1;
  nextBtn.disabled = photos.length <= 1;
  likeBtn.disabled = false;

  updateLikedCount();
}

function showNext() {
  if (photos.length === 0) return;
  index = (index + 1) % photos.length;
  render();
}

function showPrev() {
  if (photos.length === 0) return;
  index = (index - 1 + photos.length) % photos.length;
  render();
}

function toggleLike() {
  if (photos.length === 0) return;
  const url = photos[index];
  if (liked.has(url)) {
    liked.delete(url);
  } else {
    liked.add(url);
  }
  saveLiked();
  render();
}

async function loadPhotos() {
  try {
    const res = await fetch(BREED_IMAGES_URL);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();
    if (data.status !== "success" || !Array.isArray(data.message) || data.message.length === 0) {
      throw new Error("No chow chow photos found");
    }
    photos = shuffle(data.message);
    render();
  } catch (err) {
    statusEl.textContent = "Couldn't fetch chow chow photos. Please refresh to try again.";
  }
}

prevBtn.addEventListener("click", showPrev);
nextBtn.addEventListener("click", showNext);
likeBtn.addEventListener("click", toggleLike);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") showPrev();
  else if (e.key === "ArrowRight") showNext();
  else if (e.key.toLowerCase() === "l") toggleLike();
});

loadPhotos();
