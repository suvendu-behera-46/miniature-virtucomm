// Runs once when the server starts, before any request is handled.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { selectQueryEngine } = await import("./lib/prisma-engine");
    selectQueryEngine();
  }
}
