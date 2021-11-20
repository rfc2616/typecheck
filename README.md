# typecheck

a simple way to ensure objects follow a specific schema.

Usage:

```ts
import { checkType, schema } from "./typeCheck.ts";

type exampleType = {
  id: string;
  name: string;
  tags: number[];
}

const exampleTypeSchema: schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    tags: {
      type: "array",
      children: { type: "number" },
      validator: (tags: number[]) => tags.every((tag, index) => tags.filter(filterTag => filterTag === tag).length === 1) || "duplicate tags"
    }
  },
  required: ["id", "name", "tags"]
}

export async function isExampleType(object: any) {
  const result = await checkType(object, exampleTypeSchema);
  return { error: result, object: object as exampleType }; 
}
```
