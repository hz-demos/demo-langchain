import fs from "node:fs/promises";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { TavilySearch } from "@langchain/tavily";

const client = new MultiServerMCPClient({
  context7: {
    transport: "http",
    url: "https://mcp.context7.com/mcp",
    headers: {
      CONTEXT7_API_KEY: "$$$",
    },
  },
});

const tools = await client.getTools();

const llmForTool = new ChatOllama({
  model: "llama3-groq-tool-use",
});

const llmWithTools = llmForTool.bindTools(tools);

const resultFromTool = await llmWithTools.invoke(
  "What's the newest route feature of the latest stable version of Next.js? use context7."
);

console.log(resultFromTool);
