/// <reference types="vitest" />

import { vi } from "vitest";
declare global {
  const vi: typeof import("vitest").vi;
}
