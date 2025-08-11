import { createServer } from "node:net";
import { setTimeout } from "node:timers/promises";

/**
 * Find an available port on the system
 */
export async function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    
    server.listen(0, () => {
      const address = server.address();
      if (address !== null && typeof address !== "string") {
        const port = address.port;
        server.close(() => {
          resolve(port);
        });
      } else {
        server.close();
        reject(new Error("Failed to get port from server"));
      }
    });
    
    server.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Wait for a port to become available (server is listening)
 */
export async function waitForPort(
  port: number, 
  host = "localhost",
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 10000, interval = 100 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = createServer().listen(port, host);
        
        socket.on("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            // Port is in use, which means server is ready
            resolve();
          } else {
            reject(err);
          }
        });
        
        socket.on("listening", () => {
          // Port was free, server not ready yet
          socket.close(() => {
            reject(new Error("Port not in use"));
          });
        });
      });
      
      // If we get here, port is in use (server is ready)
      return;
    } catch {
      // Port not ready yet, wait and retry
      await setTimeout(interval);
    }
  }
  
  throw new Error(`Timeout waiting for port ${String(port)} to be ready`);
}

/**
 * Check if a port is available
 */
export async function isPortAvailable(port: number, host = "localhost"): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, host, () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}