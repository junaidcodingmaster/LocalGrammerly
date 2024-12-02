import { SummarizeAI } from "./ai/summarize-ai.js";
import { Messenger } from "./components/messaging.js";

const summarizeAI = new SummarizeAI();
const msg = new Messenger();
const CONTEXT_MENU_ITEM_ID = "localGrammarly-summarize";

// Initialize the model
const modelInit = async () => {
  try {
    await summarizeAI.init();
    console.log("Model - READY");
  } catch (error) {
    console.error("Error initializing model:", error);
    msg.pushError("Failed to initialize AI model.");
  }
};

// Generate a summary from the highlighted text
const summaryInitOnHighlight = async (text) => {
  try {
    return await summarizeAI.summaryMaker(text);
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
};

// Store the selected text for the popup
let selectedText = "";

// Listener for when the extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  if (summarizeAI.checkCompatibility() === true) {
    await modelInit();
  } else {
    msg.pushError("Your device or browser is not compatible.");
  }

  chrome.contextMenus.create({
    id: CONTEXT_MENU_ITEM_ID,
    title: "Summarize using AI",
    contexts: ["selection"],
  });
});

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === CONTEXT_MENU_ITEM_ID && info.selectionText) {
    selectedText = info.selectionText; // Store the highlighted text

    chrome.windows.create({
      url: chrome.runtime.getURL("../popup/summarizeOnHighlight/index.html"),
      type: "popup",
      width: 500,
      height: 500,
    });
  }
});

// Listener for messages from the popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "summarizer-port") {
    port.onMessage.addListener(async (message) => {
      const { action, text } = message; // Destructure message

      switch (action) {
        case "get-highlighted-text":
          port.postMessage({
            action: "send-highlighted-text",
            text: selectedText,
          });
          break;

        case "get-summary":
          try {
            const summary = await summaryInitOnHighlight(text);
            port.postMessage({ status: "ready", summary });
          } catch (error) {
            console.error("Error getting summary:", error);
            port.postMessage({
              status: "error",
              message: "Failed to generate summary.",
            });
          }
          break;

        default:
          console.warn(`Unknown action: ${action}`);
          break;
      }
    });
  }
});
