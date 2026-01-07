# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-01-07

### Added

- REST API client for accessing historical earthquake and tsunami data
- `P2PQuakeRestClient` class with four methods:
  - `getQuakes()` - Get list of earthquakes with query parameters
  - `getQuakeById(id)` - Get specific earthquake by ID
  - `getTsunamis()` - Get list of tsunamis with query parameters
  - `getTsunamiById(id)` - Get specific tsunami by ID
- Query parameter interfaces: `QuakeQueryOptions` and `TsunamiQueryOptions`
- Optional rate limiting feature with token bucket algorithm
- Comprehensive query parameter validation
- Support for filtering by magnitude, seismic intensity, prefectures, and date ranges
- REST API usage examples in documentation
- `RateLimitError` for rate limit handling
- `NotFoundError` for 404 errors when fetching by ID
- REST API endpoints constants in `REST_ENDPOINTS`
- Query limits constants in `QUERY_LIMITS`
- Default rate limit configuration in `DEFAULT_RATE_LIMIT_CONFIG`

### Changed

- Reorganized file structure: moved clients to `src/clients/` directory
  - `src/client.ts` → `src/clients/ws.ts`
  - `src/rest-client.ts` → `src/clients/rest.ts`
- Renamed WebSocket client class from `P2PQuakeClient` to `P2PQuakeWebSocketClient` for clarity
- Renamed WebSocket client options interface from `ClientOptions` to `WebSocketClientOptions`
- Renamed `ENDPOINTS` to `WS_ENDPOINTS` for consistency with protocol naming
- Restructured `REST_ENDPOINTS` to use environment-based keys:
  - `REST_ENDPOINTS.BASE_URL` → `REST_ENDPOINTS.PRODUCTION.BASE_URL`
  - `REST_ENDPOINTS.SANDBOX_BASE_URL` → `REST_ENDPOINTS.SANDBOX.BASE_URL`
  - API paths moved to `REST_ENDPOINTS.PATHS` namespace (e.g., `REST_ENDPOINTS.PATHS.JMA_QUAKE`)
- Added helper functions: `buildRestUrl()` for constructing REST API URLs, `getRestBaseUrl()` for environment base URLs
- Added type exports: `Environment` and `RestPath` for better TypeScript support

## [1.0.1] - 2026-01-06

### Changed

- GitHub Release now includes distribution files as a single tar.gz archive instead of individual files

## [1.0.0] - 2026-01-06

### Added

- Initial release of P2P Quake WebSocket client
- WebSocket client for P2P Quake earthquake information API
- Full TypeScript type definitions for all event types:
  - Code 551: JMA Earthquake Information
  - Code 552: JMA Tsunami Forecast
  - Code 554: EEW Detection
  - Code 555: Peer Distribution by Area
  - Code 556: Early Earthquake Warning
  - Code 561: User-reported Earthquake
  - Code 9611: User Quake Evaluation
- Automatic reconnection with exponential backoff strategy
  - Configurable initial delay, max delay, multiplier, and max attempts
  - Default: 1s → 2s → 4s → 8s → 16s → 30s (capped)
- Event deduplication by ID with time-windowed tracking
  - Prevents duplicate event processing
  - Automatic cleanup to prevent memory leaks
- Event filtering by event code
- Type-safe event emitter with discriminated unions
- Custom WebSocket URL support
  - Production endpoint (`wss://api.p2pquake.net/v2/ws`)
  - Sandbox endpoint (`wss://api-realtime-sandbox.p2pquake.net/v2/ws`)
  - Custom endpoints
- Custom error classes:
  - `P2PQuakeError` - Base error class
  - `ConnectionError` - WebSocket connection errors
  - `ValidationError` - Event validation errors
  - `ReconnectError` - Reconnection failures
- NPM package with provenance and dual ESM/CJS support
  - ES modules (`index.js`)
  - CommonJS (`index.cjs`)
  - TypeScript declarations (`index.d.ts`)
- GitHub Actions workflows:
  - CI workflow for testing on push/PR
  - Publish workflow with npm provenance on version tags
- Code quality tools:
  - Prettier for code formatting
  - ESLint with TypeScript support
  - EditorConfig for consistent editor settings
- Git hooks with Husky:
  - Pre-commit: format check and linting
  - Commit-msg: Conventional Commits validation with Commitlint
- Comprehensive documentation:
  - README.md with usage examples
  - API.md with detailed API reference
  - Example files for common use cases
  - CHANGELOG.md following Keep a Changelog format
- Full test coverage with Bun test runner
  - Client connection lifecycle tests
  - Deduplication tests
  - Reconnection manager tests
- TypeScript IntelliSense support for all event types
- JSDoc documentation for all public APIs
- Default production endpoint when `url` option is not specified
- `globals` package for ESLint global configuration

### Changed

- Package name from `@minagishl/p2pquake-client` to `p2pquake-client`
- `url` option in `ClientOptions` is now optional (defaults to `ENDPOINTS.PRODUCTION`)
- Constructor can be called without any arguments for simplified usage

[Unreleased]: https://github.com/minagishl/p2pquake-client/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/minagishl/p2pquake-client/releases/tag/v1.1.0
[1.0.1]: https://github.com/minagishl/p2pquake-client/releases/tag/v1.0.1
[1.0.0]: https://github.com/minagishl/p2pquake-client/releases/tag/v1.0.0
