function getAspectRatio (w, h) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(w, h);
  return `${Math.round(w / divisor)}:${Math.round(h / divisor)}`;
}

function isYouTubeSearchPage() {
  return location.hostname.includes('youtube.com') && location.pathname === '/results';
}

function isYouTubeWatchPage() {
  return location.hostname.includes('youtube.com') && location.pathname === '/watch';
}

function injectToSearchPage() {
  const items = document.querySelectorAll('ytd-video-renderer');

  items.forEach((item) => {
    if (item.querySelector('.aspect-ratio-label')) return;

    const img = item.querySelector('img');
    if (img && img.width && img.height) {
      const ratio = getAspectRatio(img.width, img.height);
      const metaLine = item.querySelector('#metadata-line');
      if (metaLine) {
        const span = document.createElement('span');
        span.className = 'aspect-ratio-label';
        span.textContent = ` • Ratio: ${ratio}`;
        span.style.color = '#aaa';
        span.style.fontSize = '0.85rem';
        metaLine.appendChild(span);
      }
    }
  });
}

function waitForElement(selector, callback) {
  const interval = setInterval(() => {
    const elem = document.querySelector(selector);
    if (elem) {
      clearInterval(interval);
      callback(elem);
    }
  }, 500);
}

function injectToWatchPage() {
    const video = document.querySelector('video');
  const viewElem = document.querySelector('span.view-count');
  
  if (!video || !viewElem) return;

  video.addEventListener('loadedmetadata' , () => {
    const ratio = getAspectRatio(video.videoWidth, video.videoHeight);
    if (!document.getElementById('aspect-ratio-label')) {
    const span = document.createElement('span');
    span.id = 'aspect-ratio-label';
    span.textContent = ` • Aspect Ratio: ${ratio}`;
    span.style.color = '#ccc';
    span.style.marginLeft = '8px';
    viewElem.appendChild(span);
    }
  });
}

function runInjection() {
  if (location.pathname === '/watch') injectToWatchPage();
  if (location.pathname === '/results') injectToSearchPage();
}

const observer = new MutationObserver(runInjection);
observer.observe(document.body, { childList: true, subtree: true });

runInjection();
