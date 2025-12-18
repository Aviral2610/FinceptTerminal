/**
 * SQLite Database Service - Re-export Facade
 * 
 * This file provides backwards compatibility by re-exporting from the modular sqlite package.
 * All functionality has been moved to src/services/sqlite/ for better maintainability.
 * 
 * Original implementation backed up at: sqliteService.original.ts
 */

// Re-export everything from the modular sqlite package
export * from './sqlite';

// Re-export the singleton instance as both named and default
export { sqliteService, sqliteService as default } from './sqlite';

// Re-export PREDEFINED_API_KEYS for backwards compatibility (this is a constant, not a type)
export const PREDEFINED_API_KEYS = [
  { key: 'FRED_API_KEY', label: 'FRED API Key', description: 'Federal Reserve Economic Data' },
  { key: 'POLYGON_API_KEY', label: 'Polygon.io API Key', description: 'Stock market data' },
  { key: 'ALPHA_VANTAGE_API_KEY', label: 'Alpha Vantage API Key', description: 'Stock & crypto data' },
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', description: 'GPT models' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', description: 'Claude models' },
  { key: 'COINGECKO_API_KEY', label: 'CoinGecko API Key', description: 'Cryptocurrency data' },
  { key: 'NASDAQ_API_KEY', label: 'NASDAQ API Key', description: 'NASDAQ market data' },
  { key: 'FINANCIAL_MODELING_PREP_API_KEY', label: 'Financial Modeling Prep', description: 'Financial statements & ratios' },
] as const;
