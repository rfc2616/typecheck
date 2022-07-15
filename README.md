# typecheck

Utility for checking if an object follows a schema and generating types from that schema.

## Usage

```ts
import {
	type schema,
	type Schematype,
	is,
	findSchemaErrors,
} from 'lib/typecheck';

const userSchema = {
	type: 'object',
	properties: {
		id: 'uint',
		name: 'string',
		data: [{ type: 'object', properties: { title: 'string', date: 'int' } }],
	},
} as const;

type user = {
	id: number;
	name: string;
	data: {
		title: string;
		date: number;
	}[];
};

function handleInput(input: any) {
	if (!is<user>(input, userSchema)) {
		const error = findSchemaErrors(input, userSchema);
		// do something with the error
		return;
	}

	// input is type user now
}
```
