//deno-lint-ignore-file no-explicit-any camelcase

/**
 *
 * @param object the object to test
 * @param schema schema to test the object with
 * @returns undefined if all checks passed or a typeError object containing the error message
 */
export async function checkType(
	object: any,
	schema: schema
): Promise<typeError | undefined> {
	switch (schema.type) {
		case 'array': {
			if (!Array.isArray(object))
				return {
					options: {
						type: {
							message: `exspected array, got ${typeof object}`,
						},
					},
				};

			if (!schema.children)
				return {
					message: `schema needs 'children' property for arrays`,
				};

			const childSchema = schema.children;
			const error: typeError & { options: Record<string, typeError> } = {
				options: {},
			};

			for (const index in object) {
				const errors = await checkType(object[index], childSchema);
				if (errors) error.options[String(index)] = errors;
			}

			if (Object.keys(error.options).length) return error;

			break;
		}

		case 'boolean': {
			if (typeof object !== 'boolean')
				return {
					options: {
						type: {
							message: `exspected boolean, got ${typeof object}`,
						},
					},
				};
			break;
		}

		case 'integer': {
			if (!Number.isInteger(object) || object < 0)
				return {
					options: {
						type: {
							message: `exspected integer, got ${typeof object} (here, 'integer' also has to be >= 0)`,
						},
					},
				};
			break;
		}

		case 'null': {
			if (object !== null)
				return {
					options: {
						type: {
							message: `exspected null, got ${typeof object}`,
						},
					},
				};
			break;
		}

		case 'number': {
			if (typeof object !== 'number')
				return {
					options: {
						type: {
							message: `exspected integer, got ${typeof object}`,
						},
					},
				};
			break;
		}

		case 'object': {
			if (typeof object !== 'object') {
				return {
					options: {
						type: { message: `exspected object, got ${typeof object}` },
					},
				};
			} else if (Array.isArray(object)) {
				//arrays are objects too
				return {
					options: { type: { message: 'exspected object, got array' } },
				};
			}

			if (!schema.properties)
				return {
					message: `schema needs 'properties' property for objects`,
				};

			const error: typeError & { options: Record<string, typeError> } = {
				options: {},
			};

			const requiredProperties = schema.required || [];
			for (const p of requiredProperties) {
				if (object[p] === undefined)
					error.options[p] = { message: 'property missing' };
			}

			for (const p in object) {
				if (!schema.properties[p] && !schema.allowUnknown) {
					//true -> false, false -> true, undefined -> true
					error.options[p] = { message: 'property not allowed' };
				}
			}

			for (const index of Object.keys(object)) {
				if (!schema.properties?.[index]) break;
				const errors = await checkType(object[index], schema.properties[index]);
				if (errors) error.options[index] = errors;
			}

			if (Object.keys(error.options).length) return error;

			break;
		}

		case 'string': {
			if (typeof object !== 'string')
				return {
					options: {
						type: {
							message: `exspected string, got ${typeof object}`,
						},
					},
				};
			break;
		}
	}

	//check custom validator
	if (schema.validator) {
		const validator_result = await schema.validator(object);
		return validator_result !== true
			? { message: validator_result }
			: undefined;
	}
}

export type typeError = {
	options?: Record<string, typeError>;
	message?: string;
};

/**
 * @property properties is required for `type: 'object'`
 * @property required contains the names of all required properties
 * @property children is required for `type: 'array'`
 * @property validator can be used to validate anything
 * @property allowUnknown specifies whether only the keys in `properties` are allowed if `type === 'object'`, default `false`
 */
export type schema = {
	type:
		| 'array'
		| 'object'
		| 'boolean'
		| 'number'
		| 'integer'
		| 'string'
		| 'null';
	properties?: Record<string, schema>;
	required?: string[];
	children?: schema;
	allowUnknown?: boolean;
	validator?: validator;
};

export type validator = (
	object: any
) => validator_result | Promise<validator_result>;

export type validator_result = string | true;
