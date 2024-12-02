document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("bnt");
  if (button) {
    button.addEventListener("click", () => {
      chrome.windows.create({
        url: chrome.runtime.getURL("../pages/ai-prompt/index.html"),
      });
    });
  } else {
    console.error("Button with ID 'bnt' not found.");
  }
});
