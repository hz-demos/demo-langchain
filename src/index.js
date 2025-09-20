import { z } from "zod";

const schema = z.object({
  location: z.string().describe("The city and state. e.g. San Francisco, CA"),
});

const jsonSchema = z.toJSONSchema(schema);
console.log(jsonSchema);
