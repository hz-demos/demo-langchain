import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { z } from "zod";

const multiply = tool(
  ({ a, b }) => {
    return `${a} * ${b} = ${a * b}`;
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.coerce.number(),
      b: z.coerce.number(),
    }),
  }
);

const tools = [multiply];

const model = new ChatOllama({
  model: "llama3.2",
});

const modelWithTools = model.bindTools(tools);

const messages = [
  new HumanMessage("What is 2123123 * 391? Ensure you use the 'multiply' tool."),
];

const response = await modelWithTools.invoke(messages);

if (response.tool_calls && response.tool_calls.length > 0) {
  console.log("Model wants to call a tool:");
  console.log(JSON.stringify(response.tool_calls, null, 2));

  const toolCall = response.tool_calls[0];
  console.log("\nTool arguments:", toolCall.args);
  const toolOutput = await multiply.invoke(toolCall.args);

  messages.push(response);
  messages.push(new ToolMessage(toolOutput, toolCall.id));

  console.log("\nCalling tool and sending output back to the model...");
  const finalResponse = await modelWithTools.invoke(messages);

  console.log("\nFinal response from model:");
  console.log(finalResponse.content);
} else {
  console.log("Final response from model:");
  console.log(response.content);
}
