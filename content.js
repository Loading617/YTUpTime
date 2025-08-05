function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("v");
}

async function fetchUploadTime(videoId) {
  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const videoId = getVideoId();
  if (!videoId) return;

  const uploadTimeISO = await fetchUploadTime(videoId);
  if (uploadTimeISO) return;

  const relativeTime = formatRelativeTime(uploadTimeISO);
  const exactTime = new Date(uploadTimeISO).toLocaleString();

  const replaceTarget = document.querySelector("#info-strings yt-formatted-strings");
  if(!replaceTarget) return;

  replaceTarget.dataset.relativeTime = relativeTime;
  replaceTarget.dataset.exactTime = exactTime;
  replaceTarget.textContent = relativeTime;
  replaceTarget.title = exactTime;

  const descObserver = new MutationObserver(() => {
    const isExpanded = document.querySelector("#description #collapse") !== null;
    replaceTarget.textContent = isExpanded ? exactTime : relativeTime;
    replaceTarget.title = exactTime;
  });

  const descContainer = document.querySelector("#description");
  if (descContainer) {
    descObserver.observe(descObserver, { childList: true, subtree: true });
  }

  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.items?.[0]?.snippet?.publishedAt;
  } catch (err) {
    console.error("Failed to fetch upload time:", err);
    return null;
  }
}

function displayUploadTime(datetime) {
  if (document.getElementById("upload-time-extension")) return;

  const time = new Date(datetime).toLocaleString();
  const infoSection = document.querySelector("#info-strings");
  if (infoSection) {
    const timeEl = document.createElement("div");
    timeEl.id = "upload-time-extension";
    timeEl.className = "upload-time-style";
    timeEl.textContent = `Uploaded on: ${time}`;
    infoSection.appendChild(timeEl);
  }
}

async function handleUploadTime() {
  const videoId = getVideoId();
  if (!videoId) return;

  const time = await fetchUploadTime(videoId);
  if (time) displayUploadTime(time);
}

const observer = new MutationObserver(() => {
  if (location.href.includes("/watch")) {
    setTimeout(handleUploadTime, 1000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
