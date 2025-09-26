import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
  model: "llama3.2",
});

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const messages = [
  new SystemMessage("Translate the following from English into Italian"),
  new HumanMessage("hi!"),
];

const result = await model.invoke(messages);
console.log(result.content);
