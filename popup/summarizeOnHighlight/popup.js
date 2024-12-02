let HIGHLIGHTED_TEXT = "";
var converter = new showdown.Converter();

// Initialize the popup and request highlighted text
async function init() {
  const contextTextArea = document.querySelector(".selected-text");
  if (!contextTextArea) {
    console.error("Text area with class 'selected-text' not found.");
    return;
  }

  const port = chrome.runtime.connect({ name: "summarizer-port" });
  if (!port) {
    console.error("Failed to connect to the summarizer port.");
    return;
  }

  // Request the highlighted text from the background script
  port.postMessage({ action: "get-highlighted-text" });

  port.onMessage.addListener((response) => {
    if (response.action === "send-highlighted-text") {
      HIGHLIGHTED_TEXT = response.text || ""; // Store the highlighted text
      contextTextArea.value = HIGHLIGHTED_TEXT; // Display it in the textarea
    } else {
      console.error("Unexpected response action:", response.action);
    }
  });

  port.onDisconnect.addListener(() => {
    console.warn("Port disconnected unexpectedly.");
  });
}

// Displays a loading screen (inside a wrapper)
function showLoadingScreen(message = "Processing...") {
  const wrapper = document.querySelector(".dynamic-content");
  if (!wrapper) {
    console.error("Dynamic content wrapper not found.");
    return;
  }
  wrapper.innerHTML = `
    <p style="text-align: center; font-size: 24px; position: absolute; top: 40%; left: 20%;">
      <b>${message}</b>
    </p>`;
}

// Displays the AI's summarized output (inside a wrapper)
function displaySummary(summary) {
  // Sanitizing the HTML to prevent XSS
  const safeSummary = converter.makeHtml(summary);
  const wrapper = document.querySelector(".dynamic-content");
  if (!wrapper) {
    console.error("Dynamic content wrapper not found.");
    return;
  }
  wrapper.innerHTML = `
    <div class="container">
      ${safeSummary || "<h1>No summary available.</h1>"}
    </div>`;
}

// Main function to request a summary from the AI
function main() {
  const contextTextArea = document.querySelector(".selected-text");
  if (!contextTextArea) {
    alert("Text area not found.");
    return;
  }

  const userInput = contextTextArea.value.trim();
  if (!userInput) {
    alert("Please provide some text for summarization.");
    return;
  }

  showLoadingScreen();

  const port = chrome.runtime.connect({ name: "summarizer-port" });
  if (!port) {
    console.error("Failed to connect to the summarizer port.");
    return;
  }

  port.postMessage({ action: "get-summary", text: userInput });

  port.onMessage.addListener((response) => {
    if (response.status === "ready") {
      displaySummary(response.summary);
    } else {
      console.error("Unexpected response status:", response.status);
      displaySummary("Failed to retrieve summary. Please try again.");
    }
  });

  port.onDisconnect.addListener(() => {
    console.warn("Port disconnected unexpectedly.");
    displaySummary("Connection lost. Please refresh.");
  });
}

// Initialize the popup and set up event listeners
document.addEventListener("DOMContentLoaded", () => {
  init();

  const button = document.getElementById("bnt-main");
  if (button) {
    button.addEventListener("click", main);
  } else {
    console.error("Button with ID 'bnt-main' not found.");
  }
});
