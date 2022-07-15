import { describe, expect, it } from 'vitest';
import { findSchemaErrors } from './findSchemaErrors';
import { schema } from './schema';

describe('Schema validator', () => {
	let schema: schema;

	it('validates number types', () => {
		schema = 'number';
		expect(findSchemaErrors(1, schema)).eq(null);
		expect(findSchemaErrors('', schema)).not.eq(null);
	});

	it('validates boolean types', () => {
		schema = 'boolean';
		expect(findSchemaErrors(true, schema)).eq(null);
		expect(findSchemaErrors(1, schema)).not.eq(null);
	});

	it('validates string types', () => {
		schema = 'string';
		expect(findSchemaErrors('', schema)).eq(null);
	});

	it('validates int types', () => {
		schema = 'int';
		expect(findSchemaErrors(-1, schema)).eq(null);
		expect(findSchemaErrors(1, schema)).eq(null);
		expect(findSchemaErrors(0.5, schema)).not.eq(null);
		expect(findSchemaErrors('', schema)).not.eq(null);
	});

	it('validates uint types', () => {
		schema = 'uint';
		expect(findSchemaErrors(-1, schema)).not.eq(null);
		expect(findSchemaErrors(1, schema)).eq(null);
		expect(findSchemaErrors(0.5, schema)).not.eq(null);
		expect(findSchemaErrors('', schema)).not.eq(null);
	});

	it('works with arrays', () => {
		schema = ['int'];
		expect(findSchemaErrors(1, schema)).not.eq(null);
		expect(findSchemaErrors([0, 1, 2], schema)).eq(null);
	});

	it('checks all elements in an array', () => {
		schema = ['int'];
		expect(findSchemaErrors([0, 1, 2], schema)).eq(null);
		expect(findSchemaErrors([-1, 0, 1, 2, true], schema)).not.eq(null);
	});

	it('works with objects', () => {
		schema = {
			type: 'object',
			properties: {
				a: 'boolean',
				b: ['uint'],
				c: {
					type: 'object',
					properties: { d: { type: 'string', optional: true } },
				},
			},
		};
		expect(findSchemaErrors({ a: false, b: [1], c: { d: '' } }, schema)).eq(
			null
		);
		expect(findSchemaErrors({ a: false, b: [1], c: {} }, schema)).eq(null);
	});

	it('works with union types', () => {
		schema = { type: 'union', types: ['int', 'bool'] };
		expect(findSchemaErrors('', schema)).not.eq(null);
		expect(findSchemaErrors(1, schema)).eq(null);
		expect(findSchemaErrors(false, schema)).eq(null);
	});

	it('works with custom validators', () => {
		schema = {
			type: 'number',
			validator(n) {
				return n === 42 || 'number must be 42';
			},
		};
		expect(findSchemaErrors(1, schema)).not.eq(null);
		expect(findSchemaErrors(42, schema)).eq(null);
	});
});
