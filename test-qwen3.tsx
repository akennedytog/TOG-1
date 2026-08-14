/**
 * Calculates the nth Fibonacci number
 * @param n - The position in the Fibonacci sequence (0-indexed)
 * @returns The nth Fibonacci number
 */
function fibonacci(n: number): number {
  if (n < 0) {
    throw new Error("Input must be a non-negative integer");
  }
  if (n === 0) return 0;
  if (n === 1) return 1;

  let prev = 0;
  let curr = 1;

  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}

/**
 * Recursive version of Fibonacci (less efficient, for demonstration)
 * @param n - The position in the Fibonacci sequence
 * @returns The nth Fibonacci number
 */
function fibonacciRecursive(n: number): number {
  if (n < 0) {
    throw new Error("Input must be a non-negative integer");
  }
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// Example usage and test
if (require.main === module) {
  console.log("Fibonacci Sequence (iterative):");
  for (let i = 0; i <= 10; i++) {
    console.log(`F(${i}) = ${fibonacci(i)}`);
  }

  console.log("\nFibonacci Sequence (recursive):");
  for (let i = 0; i <= 10; i++) {
    console.log(`F(${i}) = ${fibonacciRecursive(i)}`);
  }
}

export { fibonacci, fibonacciRecursive };
