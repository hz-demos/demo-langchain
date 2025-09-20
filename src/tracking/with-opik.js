import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Opik } from "opik";
import { OpikCallbackHandler } from "opik-langchain";

// @see https://js.langchain.com/docs/tutorials/llm_chain/#prompt-templates

const model = new ChatOllama({
  model: "gemma3",
  // callbacks: [opikHandler],
  callbacks: [
    {
      handleLLMEnd(output) {
        console.log(output.generations[0][0]);
      },
    },
  ],
});

const systemTemplate = "Translate the following from English into {language}";

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{text}"],
]);

const promptValue = await promptTemplate.invoke({
  language: "italian",
  text: "hi!",
});

// console.log(promptValue);

const response = await model.invoke(promptValue);
console.log(response.content);

// await opikHandler.flushAsync();
