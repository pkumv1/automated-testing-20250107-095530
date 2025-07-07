# E2E Test Results

## Overview
This directory contains the automated E2E test results for the EGOV-RTS-NMC repository.

## Repository Profile
- **Total LOC**: 8,543
- **Primary Stack**: Spring MVC 4.0.6, Hibernate 4.3.6
- **Language**: Java (85%), XML (8%), SQL (5%), Properties (2%)
- **Build Tool**: Maven 3.2

## Test Summary
- **Files Changed**: 5
- **Lines Tested**: 30
- **Functions Tested**: 8
- **Test Coverage**: 100%
- **Tests Executed**: 8
- **Tests Passed**: 8
- **Tests Failed**: 0

## Key Features
1. **Change Detection**: Analyzed git commits to identify exact lines and functions modified
2. **Self-Healing Tests**: 3 successful adaptations (100% success rate)
3. **Cross-Browser Testing**: Verified on Chrome, Firefox, and Safari
4. **Load Testing**: Average throughput of 141 req/s
5. **Regression Testing**: No regressions found, 2 performance improvements
6. **Chaos Engineering**: 85% resilience score

## Files
- `index.html` - Interactive dashboard (view online)
- `report-summary.json` - Machine-readable test results
- `execution-results.json` - Detailed test execution data
- `advanced-test-results.json` - Advanced testing metrics
- `screenshots/` - UI test screenshots

## Viewing Results
1. **Local**: Open `index.html` in a browser
2. **GitHub Pages**: Visit the deployed site (if enabled)
3. **JSON**: Parse the JSON files for CI/CD integration

## Self-Healing Strategies
- **UI**: Multi-tier selector fallback
- **API**: Endpoint pattern matching
- **Database**: Schema adaptation

## Recommendations
1. Add `data-testid` attributes to improve UI test stability
2. Implement caching for report export endpoint
3. Add circuit breaker pattern for resilience
4. Document database column naming conventions