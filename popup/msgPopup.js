function getMsgFromBg(key) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: key }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Error:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(response);
      }
    });
  });
}

function sendMsgToBg({ key, value }) {
  chrome.runtime.sendMessage({ type: key, message: value });
}
