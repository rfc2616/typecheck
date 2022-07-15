import { isObjectEmpty } from './helpers';
import type { schema } from './schema';

export type schemaError = {
	message?: string;
	properties?: Record<string | number, schemaError>;
};
/**
 * Searches for any mismatches between an object and a schema.
 * @param object the object to try to apply the schema to
 * @param schema the schema
 * @returns any found errors or null
 */
export function findSchemaErrors(
	object: any,
	schema: schema
): schemaError | null {
	if (typeof schema === 'string') {
		return findSchemaErrors(object, { type: schema });
	} else if (schema instanceof Array) {
		return findSchemaErrors(object, { type: 'array', children: schema[0] });
	}

	switch (schema.type) {
		case 'array': {
			if (object instanceof Array === false) {
				return {
					message: `expected array, got ${typeof object}`,
				};
			}

			const errors: Record<string, schemaError> = {};
			for (const i in object) {
				const error = findSchemaErrors(object[i], schema.children);
				if (error) errors[i] = error;
			}

			if (!isObjectEmpty(errors)) return { properties: errors };
			break;
		}

		case 'bool':
		case 'boolean': {
			if (typeof object !== 'boolean') {
				return {
					message: `expected boolean, got ${typeof object}`,
				};
			}
			break;
		}

		case 'int': {
			if (typeof object !== 'number' || object % 1 !== 0) {
				return {
					message: `expected int, got ${typeof object}`,
				};
			}
			break;
		}

		case 'null': {
			if (typeof object !== 'object' || object !== null) {
				return {
					message: `expected null, got ${typeof object}`,
				};
			}
			break;
		}

		case 'number': {
			if (typeof object !== 'number') {
				return {
					message: `expected number, got ${typeof object}`,
				};
			}
			break;
		}

		case 'object': {
			if (typeof object !== 'object') {
				return {
					message: `expected object, got ${typeof object}`,
				};
			}
			if (object instanceof Array) {
				return {
					message: `expected object, got array`,
				};
			}

			const errors: Record<string, schemaError> = {};
			for (const k in object) {
				if (!schema.properties[k]) {
					errors[k] = { message: 'property is not allowed' };
				} else {
					const error = findSchemaErrors(object[k], schema.properties[k]!);
					if (error) errors[k] = error;
				}
			}

			//check for required properties
			for (let k in schema.properties) {
				if (object[k] !== undefined) continue;
				const v = schema.properties[k]!;
				if (
					typeof v === 'string' ||
					v instanceof Array ||
					v.optional !== true
				) {
					errors[k] = {
						message: 'property missing but required in the schema',
					};
				}
			}

			if (!isObjectEmpty(errors)) return { properties: errors };
			break;
		}

		case 'string': {
			if (typeof object !== 'string') {
				return {
					message: `expected string, got ${typeof object}`,
				};
			}
			break;
		}

		case 'uint': {
			if (typeof object !== 'number' || object < 0 || object % 1 !== 0) {
				return {
					message: `expected uint, got ${typeof object}`,
				};
			}
			break;
		}

		case 'union': {
			let matches = false;
			const errors: Record<string, schemaError> = {};
			for (const i in schema.types) {
				const error = findSchemaErrors(object, schema.types[i]!);
				if (error === null) matches = true;
				else errors[`unionOption${i}`] = error;
			}
			if (!matches) {
				return {
					message: 'does not match any of the possible union types',
					properties: errors,
				};
			}
			break;
		}
	}

	if (schema.validator) {
		const result = schema.validator(object);
		if (typeof result === 'string') return { message: result };
	}

	return null;
}

export class SchemaError extends Error {
	error: schemaError;

	/**
	 * Creates a new SchemaError
	 * @param error the schemaError
	 */
	constructor(error: schemaError) {
		super('');
		this.error = error;
	}
}
