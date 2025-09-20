import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// @see https://js.langchain.com/docs/tutorials/llm_chain/#prompt-templates
// @see https://js.langchain.com/docs/concepts/prompt_templates/

const model = new ChatOllama({
  model: "gemma3",
});

async function example1() {
  const systemTemplate = "Translate the following from English into {language}";

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  const promptValue = await promptTemplate.invoke({
    language: "italian",
    text: "hi!",
  });

  const response = await model.invoke(promptValue);
  console.log(response.content);
}

example1();

async function example2() {
  const system =
    "You are a helpful assistant that translates {input_lang} to {output_lang}. Translate the user sentence.";
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", system],
    ["human", "{input}"],
  ]);

  const chain = prompt.pipe(model);

  const aiMsg = await chain.invoke({
    input_lang: "English",
    output_lang: "French",
    input: "I love programming.",
  });

  console.log(aiMsg.content);
}

example2();
