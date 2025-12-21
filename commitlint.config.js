module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // New feature
        "fix",      // Bug fix
        "docs",     // Documentation
        "style",    // Formatting
        "refactor", // Code refactoring
        "perf",     // Performance
        "test",     // Tests
        "build",    // Build system
        "ci",       // CI configuration
        "chore",    // Maintenance
        "revert",   // Revert changes
        "security", // Security fixes
        "types",    // TypeScript types
        "config",   // Configuration
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "header-max-length": [2, "always", 100],
  },
};
