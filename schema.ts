import { findSchemaErrors } from './findSchemaErrors';

type primitive =
	| 'bool'
	| 'boolean'
	| 'uint'
	| 'int'
	| 'null'
	| 'number'
	| 'string';

type baseSchema = {
	type: string;
	validator?: (value: any) => true | string;
};

interface primitiveSchema extends baseSchema {
	type: primitive;
}

interface arraySchema extends baseSchema {
	type: 'array';
	children: schema;
}

interface objectSchema extends baseSchema {
	type: 'object';
	properties: Record<string, schema & { optional?: boolean }>;
}

interface unionSchema extends baseSchema {
	type: 'union';
	types: schema[];
}

export type schema =
	| primitive
	| primitiveSchema
	| objectSchema
	| arraySchema
	| unionSchema
	| [schema];

/**
 * Checks if an object follows a specific schema.
 * @param object the object to check
 * @param schema the schema the object should follow
 * @returns if the schema can be applied to the object
 */
export function isType<t>(object: any, schema: schema): object is t {
	return findSchemaErrors(object, schema) === null;
}
