# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-XX

### Added

- Initial release of P2P Quake WebSocket client
- WebSocket client for P2P Quake earthquake information API
- Full TypeScript type definitions for all event types:
  - 551: JMA Earthquake Information
  - 552: JMA Tsunami Forecast
  - 554: EEW Detection
  - 555: Peer Distribution by Area
  - 556: Early Earthquake Warning
  - 561: User-reported Earthquake
  - 9611: User Quake Evaluation
- Automatic reconnection with exponential backoff strategy
- Event deduplication by ID with time-windowed tracking
- Event filtering by event code
- Type-safe event emitter with discriminated unions
- Custom WebSocket URL support (production, sandbox, or custom)
- Memory-safe resource management with cleanup methods
- Comprehensive error handling with custom error classes:
  - `P2PQuakeError` - Base error
  - `ConnectionError` - WebSocket connection errors
  - `ValidationError` - Event validation errors
  - `ReconnectError` - Reconnection failures
- NPM package with provenance and dual ESM/CJS support
- GitHub Actions workflows for CI and automated publishing
- Comprehensive documentation and examples
- Full test coverage for core functionality

### Developer Experience

- TypeScript IntelliSense support for all event types
- JSDoc documentation for all public APIs
- Example files for common use cases
- Sensible defaults for quick setup

[Unreleased]: https://github.com/minagishl/p2pquake-client/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/minagishl/p2pquake-client/releases/tag/v1.0.0
