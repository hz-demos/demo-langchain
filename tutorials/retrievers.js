import { Document } from "@langchain/core/documents";
import assert from "node:assert";

const documents = [
  new Document({
    pageContent:
      "Dogs are great companions, known for their loyalty and friendliness.",
    metadata: { source: "mammal-pets-doc" },
  }),
  new Document({
    pageContent: "Cats are independent pets that often enjoy their own space.",
    metadata: { source: "mammal-pets-doc" },
  }),
];

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const pdfPath = process.argv[2];

assert(pdfPath, "Please provide a PDF path");

const loader = new PDFLoader(pdfPath);

const docs = await loader.load();
console.log(docs.length);

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const allSplits = await textSplitter.splitDocuments(docs);

allSplits.length;

import { OllamaEmbeddings } from "@langchain/ollama";

const embeddingsModel = new OllamaEmbeddings({
  model: "mxbai-embed-large", // Default value
  baseUrl: "http://localhost:11434", // Default value
});

const vector1 = await embeddingsModel.embedQuery(allSplits[0].pageContent);
const vector2 = await embeddingsModel.embedQuery(allSplits[1].pageContent);

console.assert(vector1.length === vector2.length);
console.log(`Generated vectors of length ${vector1.length}\n`);
console.log(vector1.slice(0, 10));

import { MemoryVectorStore } from "langchain/vectorstores/memory";

const vectorStore = new MemoryVectorStore(embeddingsModel);

await vectorStore.addDocuments(allSplits);

const results1 = await vectorStore.similaritySearch(
  "When was Nike incorporated?"
);

console.log(results1[0]);

const results2 = await vectorStore.similaritySearchWithScore(
  "What was Nike's revenue in 2023?"
);

console.log(results2[0]);

const embedding = await embeddingsModel.embedQuery(
  "How were Nike's margins impacted in 2023?"
);

const results3 = await vectorStore.similaritySearchVectorWithScore(
  embedding,
  1
);

console.log(results3[0]);

const retriever = vectorStore.asRetriever({
  searchType: "mmr",
  searchKwargs: {
    fetchK: 1,
  },
});

const results4 = await retriever.batch([
  "When was Nike incorporated?",
  "What was Nike's revenue in 2023?",
]);

console.log(results4[0]);
