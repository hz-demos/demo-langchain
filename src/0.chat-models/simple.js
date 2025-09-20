// import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
  model: "llama3.2",
});

async function chatWithOpenAIFormat() {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is 2123123 * 391?" },
  ];

  const result = await model.invoke(messages);
  return result;
}

console.log(await chatWithOpenAIFormat());
