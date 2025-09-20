import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";

const llmForWSO = new ChatOllama({
  model: "llama3.2",
});

const schema = z.object({
  location: z.string().describe("The city and state. e.g. San Francisco, CA"),
});

const schemaForWSO = z.toJSONSchema(schema);

const llmWithStructuredOutput = llmForWSO.withStructuredOutput(schemaForWSO, {
  name: "get_current_weather",
});

const resultFromWSO = await llmWithStructuredOutput.invoke(
  "What's the weather like today in San Francisco? Ensure you use the 'get_current_weather' tool."
);

console.log(resultFromWSO);
