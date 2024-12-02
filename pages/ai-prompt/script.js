// Initialize the Markdown converter
const converter = new showdown.Converter();
const tempInput = document.getElementById("temp").value;
const topKInput = document.getElementById("topk").value;


(async () => {
  const promptInput = document.getElementById("prompt-input");
  const responseArea = document.getElementById("response-content");

  let session = null;

  // Check for AI support
  if (!self.ai || !self.ai.languageModel) {
    responseArea.innerHTML =
      "Error: Your browser doesn't support the AI Prompt API.";
    return;
  }

  // Function to prompt the AI and handle streaming response
  const promptModel = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    responseArea.innerHTML = "Generating response...";
    let fullResponse = "";

    try {
      if (!session) await updateSession();

      const stream = await session.promptStreaming(prompt);

      for await (let chunk of stream) {
        fullResponse += chunk.trim(); // Append each chunk of data
      }

      // Convert the response to HTML using Markdown converter
      responseArea.innerHTML = converter.makeHtml(fullResponse);
    } catch (error) {
      responseArea.innerHTML = `Error: ${error.message}`;
    }
  };

  // Function to create or update the AI session
  const updateSession = async () => {
    try {
      session = await self.ai.languageModel.create({
        temperature: tempInput, //0.7
        topK: topKInput, // 40 Controls diversity of the output
      });
    } catch (error) {
      responseArea.innerHTML = "Error: Failed to initialize AI session.";
      console.error("Session initialization failed:", error);
    }
  };

  // Event listener for form submission
  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission
    promptModel(); // Call the function to get AI response
  });

  // Initialize AI session on page load
  await updateSession();
})();
