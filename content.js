function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get("v");
}

function formatRelativeTime(dateStr) {
  const uploadDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now - uploadDate;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

async function fetchUploadTime(videoId) {
  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.items?.[0]?.snippet?.publishedAt;
  } catch (err) {
    console.error("Failed to fetch upload time:", err);
    return null;
  }
}

async function injectCustomUploadTime() {
  const videoId = getVideoId();
  if (!videoId) return;

  const uploadTimeISO = await fetchUploadTime(videoId);
  if (!uploadTimeISO) return;

  const relativeTime = formatRelativeTime(uploadTimeISO);
  const exactTime = new Date(uploadTimeISO).toLocaleString();

  const replaceTarget = document.querySelector("#info-strings yt-formatted-string");
  if (!replaceTarget) return;

  replaceTarget.dataset.relativeTime = relativeTime;
  replaceTarget.dataset.exactTime = exactTime;
  replaceTarget.textContent = relativeTime;

  const descObserver = new MutationObserver(() => {
    const isExpanded = document.querySelector("#description #collapse") !== null;
    replaceTarget.textContent = isExpanded ? exactTime : relativeTime;
  });

  const descContainer = document.querySelector("#description");
  if (descContainer) {
    descObserver.observe(descContainer, { childList: true, subtree: true });
  }
}

const mainObserver = new MutationObserver(() => {
  if (location.href.includes("/watch")) {
    setTimeout(injectCustomUploadTime, 1000);
  }
});
mainObserver.observe(document.body, { childList: true, subtree: true });
