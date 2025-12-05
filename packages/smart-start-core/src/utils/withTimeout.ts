/**
 * Execute a promise with a timeout
 * @param promise Promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutError Error message if timeout occurs
 * @returns Promise result or throws timeout error
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    ),
  ]);
}
