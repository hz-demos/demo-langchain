import fs from "node:fs";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";
import { TavilySearch } from "@langchain/tavily";

const llm = new ChatOllama({
  model: "qwen3",
  temperature: 0,
});


const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  // includeAnswer: false,
  // includeRawContent: false,
  // includeImages: false,
  // includeImageDescriptions: false,
  // searchDepth: "basic",
  // timeRange: "day",
  // includeDomains: [],
  // excludeDomains: [],
});

const llmWithTools = llm.bindTools([tool]);

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  ["placeholder", "{messages}"],
]);

const chain = prompt.pipe(llmWithTools);

const toolChain = RunnableLambda.from(async (userInput, config) => {
  const humanMessage = new HumanMessage(userInput);
  const aiMsg = await chain.invoke(
    {
      messages: [new HumanMessage(userInput)],
    },
    config
  );
  const toolMsgs = await tool.batch(aiMsg.tool_calls, config);
  return chain.invoke(
    {
      messages: [humanMessage, aiMsg, ...toolMsgs],
    },
    config
  );
});

const toolChainResult = await toolChain.invoke("最近世界局势怎样？");

console.log(toolChainResult);
