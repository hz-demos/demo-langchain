import fs from "node:fs";
import { TavilySearch } from "@langchain/tavily";

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

const result = await tool.invoke({
  query: "如何学习 RAG ?",
});
fs.writeFileSync("result.json", JSON.stringify(result, null, 2));
