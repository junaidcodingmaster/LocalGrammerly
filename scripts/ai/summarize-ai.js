export class SummarizeAI {
  checkCompatibility = () => {
    return "ai" in self && "summarizer" in self.ai;
  };

  init = async () => {
    const summarizer = await self.ai.summarizer.capabilities();
    const availability = await summarizer.available;

    this.summarizer = await self.ai.summarizer.create();

    if (availability !== "readily") {
      this.summarizer.addEventListener("downloadprogress", (e) => {
        console.log(`Downloading: ${e.loaded} / ${e.total}`);
      });
      await this.summarizer.ready;
      console.log("MODEL - READY!");
    }
  };

  summaryMaker = async (text) => {
    try {
      if (!this.summarizer) {
        console.error("summaryMaker is not initialized. Call init() first.");
        return null;
      }
      let data = "";
      data = await this.summarizer.summarize(text);
      return data;
    } catch (error) {
      console.error("Error summarizing text:", error);
      return null;
    }
  };
}
