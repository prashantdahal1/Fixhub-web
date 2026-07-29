/** @type {import('jest').Config} */
export default {
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "text-summary"],
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/__tests__/**",
    "!src/types/**",
    "!src/scripts/**",
    "!src/clear_data.js",
    "!src/server.ts",
    "!src/index.ts",
    "!**/node_modules/**"
  ],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "NodeNext",
          esModuleInterop: true,
          isolatedModules: true,
          ignoreDeprecations: "6.0",
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
};
