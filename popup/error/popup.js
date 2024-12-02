async function handleMessage() {
  try {
    const response = await getMsgFromBg("error");
    document.getElementById("errorMessage").innerText = response;
  } catch (error) {
    document.getElementById("errorMessage").innerText = error;
  }
}

handleMessage();
