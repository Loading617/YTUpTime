function getUploadDateFromYtInitialData() {
    const scripts = [...document.scripts];
    for (const script of scripts) {
      if (script.textContent.includes("var ytInitialPlayerResponse")) {
        const match = script.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});/s);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            return data?.microformat?.playerMicroformatRenderer?.uploadDate;
          } catch (e) {
            console.error("Failed to parse uploadDate", e);
          }
        }
      }
    }
    return null;
  }
  
  function addUploadTime() {
    const existing = document.getElementById("upload-time-extension");
    if (existing) return;
  
    const uploadDate = getUploadDateFromYtInitialData();
    if (!uploadDate) return;
  
    const uploadTime = new Date(uploadDate).toLocaleString();
    const infoSection = document.querySelector("#info-strings");
    if (infoSection) {
      const timeElement = document.createElement("div");
      timeElement.id = "upload-time-extension";
      timeElement.textContent = `Uploaded on: ${uploadTime}`;
      timeElement.className = "upload-time-style";
      infoSection.appendChild(timeElement);
    }
  }
  
  const observer = new MutationObserver(() => {
    if (location.href.includes("/watch")) {
      setTimeout(addUploadTime, 1000);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  