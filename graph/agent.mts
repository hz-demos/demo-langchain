// agent.mts
import { writeFileSync } from "node:fs";
import "dotenv/config";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Define the tools for the agent to use
const agentTools = [new TavilySearchResults({ maxResults: 3 })];
// const agentModel = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });
const agentModel = new ChatOpenAI({
  model: "x-ai/grok-4-fast:free",
  temperature: 0.8,
  streaming: true,
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});

// Initialize memory to persist state between graph runs
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

// // Now it's time to use!
// const agentFinalState = await agent.invoke(
//   { messages: [new HumanMessage("what is the current weather in sf")] },
//   { configurable: { thread_id: "42" } }
// );

// console.log(
//   agentFinalState.messages[agentFinalState.messages.length - 1].content
// );

// const agentNextState = await agent.invoke(
//   { messages: [new HumanMessage("what about ny")] },
//   { configurable: { thread_id: "42" } }
// );

// console.log(
//   agentNextState.messages[agentNextState.messages.length - 1].content
// );

const graph = agent.getGraph();
const image = await graph.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();

const filePath = "./graphState.png";
writeFileSync(filePath, new Uint8Array(arrayBuffer));
