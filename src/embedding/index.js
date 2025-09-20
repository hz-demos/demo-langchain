import { OllamaEmbeddings } from "@langchain/ollama";

const embeddingsModel = new OllamaEmbeddings({
  model: "mxbai-embed-large", // Default value
  baseUrl: "http://localhost:11434", // Default value
});

const embeddings = await embeddingsModel.embedDocuments([
  "Hi there!",
  "Oh, hello!",
  "What's your name?",
  "My friends call me World",
  "Hello World!",
]);

console.log(`(${embeddings.length}, ${embeddings[0].length})`);

function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (norm1 * norm2);
}

function euclideanDistance(vec1, vec2) {
  return Math.sqrt(
    vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0)
  );
}

function dotProduct(vec1, vec2) {
  return vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
}

const query = await embeddingsModel.embedQuery("Who are you?");

embeddings.forEach((embedding, index) => {
  const similarity = cosineSimilarity(query, embedding);
  console.log(`Cosine similarity to "${index}": ${similarity}`);
});

embeddings.forEach((embedding, index) => {
  const distance = euclideanDistance(query, embedding);
  console.log(`Euclidean distance to "${index}": ${distance}`);
});

embeddings.forEach((embedding, index) => {
  const product = dotProduct(query, embedding);
  console.log(`Dot product to "${index}": ${product}`);
});
