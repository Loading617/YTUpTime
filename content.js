function isYouTubeSearchPage() {
  return location.hostname.includes('youtube.com') && location.pathname === '/results';
}

function isYouTubeWatchPage() {
  return location.hostname.includes('youtube.com') && location.pathname === '/watch';
}

function injectAspectRatioToSearch() {
  const items = document.querySelectorAll('#dismissible');

  items.forEach((item) => {
    if (item.querySelector('.aspect-info')) return;

    const thumb = item.querySelector('ytd-thumbnail img');
    if (thumb && thumb.width && thumb.height) {
      const ratio = getAspectRatio(thumb.width, thumb.height);
      const info = document.createElement('span');
      info.className = 'aspect-info';
      info.textContent = ` | Ratio: ${ratio}`;
      info.style.color = '#aaa';
      info.style.fontSize = '0.85rem';
      const meta = item.querySelector('#metadata-line');
      if (meta) meta.appendChild(info);
    }
  });
}

function injectAspectRatioToDescription() {
  const viewElem = document.querySelector('span.view-count');
  if (!viewElem || document.getElementById('aspect-inline')) return;

  const video = document.querySelector('video');
  if (video && video.videoWidth && video.videoHeight) {
    const ratio = getAspectRatio(video.videoWidth, video.videoHeight);
    const span = document.createElement('span');
    span.id = 'aspect-inline';
    span.style.marginLeft = '10px';
    span.style.color = '#ccc';
    span.textContent = `Aspect Ratio: ${ratio}`;
    viewElem.parentNode.insertBefore(span, viewElem.nextSibling);
  }
}

function observeChanges() {
  const observer = new MutationObserver(() => {
    if (isYouTubeSearchPage()) injectAspectRatioToSearch();
    if (isYouTubeWatchPage()) injectAspectRatioToDescription();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

observeChanges();