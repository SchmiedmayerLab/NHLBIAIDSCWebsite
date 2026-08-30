export default {
  config: {
    MD013: false,
    MD024: { siblings_only: true },
    MD033: false,
    MD041: false,
  },
  globs: [
    '**/*.md',
    '!node_modules/**',
    '!dist/**',
    '!.astro/**',
    '!coverage/**',
    '!playwright-report/**',
    '!test-results/**',
  ],
};
