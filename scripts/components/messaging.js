export class Messenger {
  constructor() {
    this.listeners = {};

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const { type, message } = request;

      if (this.listeners[type]) {
        this.listeners[type](message, sendResponse);
        return true;
      }
    });
  }

  sendMsgToPopup({ key, value }) {
    this.listeners[key] = (message, sendResponse) => {
      sendResponse(value);
    };
  }

  getMsgFromPopup(key) {
    return new Promise((resolve, reject) => {
      this.listeners[key] = (message, sendResponse) => {
        resolve(message);
        sendResponse();
      };
    });
  }

  pushError(error) {
    this.error = error;
    chrome.action.setPopup({ popup: "../../popup/error/index.html" });
    chrome.windows.create({
      url: chrome.runtime.getURL("../../pages/error.html"),
    });

    this.sendMsgToPopup({
      key: "error",
      value: error,
    });
  }
}
