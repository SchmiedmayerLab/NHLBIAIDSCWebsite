/// <reference types="astro/client" />

declare module '@citation-js/core' {
  export class Cite {
    constructor(data?: unknown, options?: Record<string, unknown>);
    data: unknown[];
  }
}
