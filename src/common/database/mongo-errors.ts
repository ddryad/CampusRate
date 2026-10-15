export interface MongoDuplicateKeyError {
  code: number;
  keyValue?: Record<string, unknown>;
  keyPattern?: Record<string, number>;
}

export function isDuplicateKeyError(
  error: unknown,
): error is MongoDuplicateKeyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}
