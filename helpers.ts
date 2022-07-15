export function isObjectEmpty(object: Record<string, unknown>) {
	return Object.keys(object).length === 0;
}
