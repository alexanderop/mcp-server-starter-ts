#!/usr/bin/env node
import { boot } from "./server/boot.js";

boot().catch((error: unknown) => {
  console.error("Fatal error in boot():", error);
  process.exit(1);
});