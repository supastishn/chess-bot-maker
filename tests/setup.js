import '@testing-library/jest-dom';

if (typeof globalThis.jest === "undefined") {
  const { jest } = await import("@jest/globals");
  globalThis.jest = jest;
}
