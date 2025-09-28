// Timeout wrapper for async operations
export async function withTimeout<T>(
  promise: Promise<T>, 
  ms: number = 8000,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(errorMessage || `Operation timed out after ${ms}ms`)), ms)
  )

  return Promise.race([promise, timeoutPromise])
}

// Specific timeout for Supabase operations
export async function withSupabaseTimeout<T>(
  promise: Promise<T>, 
  ms: number = 6000
): Promise<T> {
  return withTimeout(promise, ms, `Supabase operation timed out after ${ms}ms`)
}

// Specific timeout for fetch operations
export async function withFetchTimeout<T>(
  promise: Promise<T>, 
  ms: number = 8000
): Promise<T> {
  return withTimeout(promise, ms, `Fetch operation timed out after ${ms}ms`)
}
