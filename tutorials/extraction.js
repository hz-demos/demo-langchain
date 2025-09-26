import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";

const personSchema = z.object({
  name: z.nullable(z.string()).describe("The name of the person"),
  hair_color: z
    .nullable(z.string())
    .describe("The color of the person's hair if known"),
  height_in_meters: z.nullable(z.string()).describe("Height measured in meters"),
});

// const personSchemaForWSO = z.toJSONSchema(personSchema);

// console.log(personSchemaForWSO);

// Define a custom prompt to provide instructions and any additional context.
// 1) You can add examples into the prompt template to improve extraction quality
// 2) Introduce additional parameters to take context into account (e.g., include metadata
//    about the document from which the text was extracted.)
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you do not know the value of an attribute asked to extract,
return null for the attribute's value.`,
  ],
  // Please see the how-to about improving performance with
  // reference examples.
  // ["placeholder", "{examples}"],
  ["human", "{text}"],
]);

const model = new ChatOllama({
  model: "llama3.2",
  temperature: 0,
});

const structured_llm = model.withStructuredOutput(personSchema);

const prompt = await promptTemplate.invoke({
  text: "Alan Smith is 6 feet tall and has blond hair.",
});

const result = await structured_llm.invoke(prompt);
console.log(result);
