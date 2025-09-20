import fs from "node:fs/promises";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
  model: "huihui_ai/gemma3-abliterated",
  temperature: 0,
});

async function main(imgPath) {
  console.log(imgPath);

  const imageData = await fs.readFile(imgPath);
  const base64Image = imageData.toString("base64");
  console.log(base64Image.length);

  const systemMessage = new SystemMessage("你是一个精通中文的图像分析专家。");

  const humanMessage = new HumanMessage({
    content: [
      {
        type: "text",
        text: "这张图片包含什么内容？",
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`,
        },
      },
    ],
  });

  const result = await model.invoke([systemMessage, humanMessage]);
  console.log(result);
}

main(process.argv[2]);
