export const PROVIDER_TYPES = {
  GEMINI: "gemini",
  MOCK: "mock"
};

export const PROVIDER_CONFIGS = [
  {
    id: PROVIDER_TYPES.GEMINI,
    name: "Google Gemini 3.5 Flash-Lite",
    model: "gemini-3.5-flash-lite",
    status: "Active (Production)"
  },
  {
    id: PROVIDER_TYPES.MOCK,
    name: "Mock Simulator (Local Dev)",
    model: "simulated-gpt-4o",
    status: "Dev Only"
  }
];
