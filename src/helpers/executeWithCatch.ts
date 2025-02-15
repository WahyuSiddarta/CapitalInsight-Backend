import logger from "../logger";

export async function executeWithCatch<T>(
  fn: () => Promise<T>
): Promise<T | undefined> {
  try {
    return await fn(); // Returns the result of the function when successful
  } catch (error) {
    logger.error(error as Error); // Log error to file and display on scree
    return undefined; // Returns undefined if an error occurs
  }
}
