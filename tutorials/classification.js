import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

// Sanitize Ollama base URL. Prefer OLLAMA_BASE_URL, fallback to OLLAMA_HOST, then default.
const envBase = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
let OLLAMA_BASE_URL = envBase;
if (!/^https?:\/\//.test(OLLAMA_BASE_URL)) {
  OLLAMA_BASE_URL = `http://${OLLAMA_BASE_URL}`;
}
// If user provided just host without port, default to :11434
try {
  const u = new URL(OLLAMA_BASE_URL);
  if (!u.port) {
    u.port = "11434";
    OLLAMA_BASE_URL = u.toString().replace(/\/$/, "");
  }
  // Replace 0.0.0.0 with loopback for client connections
  if (u.hostname === "0.0.0.0") {
    u.hostname = "127.0.0.1";
    OLLAMA_BASE_URL = u.toString().replace(/\/$/, "");
  }
} catch (_) {
  // Fallback to default if URL parsing fails
  OLLAMA_BASE_URL = "http://127.0.0.1:11434";
}

const model = new ChatOllama({
  model: "llama3.2",
  temperature: 0,
  baseUrl: OLLAMA_BASE_URL,
});

console.log("Using Ollama base URL:", OLLAMA_BASE_URL);

const classification = z.object({
  sentiment: z.string().describe("The sentiment of the text"),
  aggressiveness: z
    .coerce.number()
    .int()
    .min(0)
    .max(10)
    .describe("How aggressive the text is on a scale from 0 to 10"),
  language: z.string().describe("The language the text is written in"),
});

const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Extract the desired information from the following passage.

Only extract the properties mentioned in the 'Classification' function.

You must follow these instructions to format the output exactly:
{format_instructions}

Respond with only a JSON object and nothing else. Do not include any explanations, prose, or backticks.

Passage:
{input}
`
);

const baseParser = StructuredOutputParser.fromZodSchema(classification);

// Use the base parser by default. We'll only use OutputFixingParser in the error path to avoid
// making an LLM call during startup (which could hang if the server isn't up yet).
const chain = taggingPrompt.pipe(model).pipe(baseParser);

// Lightweight JSON extraction helper to recover from minor formatting issues
function naiveExtractJson(text) {
  if (typeof text !== "string") return null;
  // Try fenced code blocks first
  const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch (_) {
      // fallthrough
    }
  }
  // Try substring between first { and last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      return null;
    }
  }
  return null;
}

try {
  const result = await chain.invoke({
    input:
      "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!",
    format_instructions: baseParser.getFormatInstructions(),
  }, { timeout: 60000 });
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error("Parsing failed, fetching raw output for debugging...\n", err?.message || err);
  try {
    const raw = await taggingPrompt.pipe(model).invoke({
      input:
        "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!",
      format_instructions: baseParser.getFormatInstructions(),
    }, { timeout: 60000 });
    const rawContent = typeof raw?.content === "string" ? raw.content : JSON.stringify(raw, null, 2);
    console.error("Raw model output:\n", rawContent);
    // Attempt a direct parse with the base parser for visibility
    try {
      const repaired = await baseParser.parse(rawContent);
      console.log("Repaired parse:\n", JSON.stringify(repaired, null, 2));
    } catch (e2) {
      console.error("Direct parse also failed:", e2?.message || e2);
      // Last resort: try naive JSON extraction from the raw content
      const naive = naiveExtractJson(rawContent);
      if (naive) {
        console.log("Naively extracted JSON:\n", JSON.stringify(naive, null, 2));
        try {
          const validated = await baseParser.parse(JSON.stringify(naive));
          console.log("Validated naive JSON:\n", JSON.stringify(validated, null, 2));
        } catch (e3) {
          console.error("Validation of naive JSON failed:", e3?.message || e3);
        }
      } else {
        console.error("Naive JSON extraction failed.");
      }
    }
  } catch (e) {
    console.error("Failed to get raw output:", e?.message || e);
  }
}
