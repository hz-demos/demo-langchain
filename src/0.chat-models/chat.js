// import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// @see https://js.langchain.com/docs/tutorials/llm_chain/

const model = new ChatOllama({
  model: "gemma3",
});

console.log(await model.invoke("Hello!"));

async function chatWithOpenAIFormat() {
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" },
  ];

  const result = await model.invoke(messages);
  return result;
}

console.log(await chatWithOpenAIFormat());

async function chatWithMessages() {
  const messages = [
    new SystemMessage("Translate the following from English into Chinese."),
    new HumanMessage("Everything is fine."),
  ];

  const result = await model.invoke(messages);
  return result;
}

console.log(await chatWithMessages());

async function chatWithStreaming() {
  const messages = [
    new SystemMessage("Translate the following from English into Chinese."),
    new HumanMessage("Everything is fine."),
  ];

  const stream = await model.stream(messages);

  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }
}

console.log(await chatWithStreaming());
