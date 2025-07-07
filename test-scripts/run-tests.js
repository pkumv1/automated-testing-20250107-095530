#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Automated E2E Testing Suite');
console.log('Repository: EGOV-RTS-NMC (Spring MVC + Hibernate)');
console.log('=====================================\n');

try {
  // Step 1: Run analysis
  console.log('📊 Step 1: Analyzing repository...');
  execSync('node test-scripts/analyze-repository.js', { stdio: 'inherit' });
  execSync('node test-scripts/detect-changes.js', { stdio: 'inherit' });
  execSync('node test-scripts/combined-analysis.js', { stdio: 'inherit' });
  
  // Step 2: Generate tests
  console.log('\n🔧 Step 2: Generating self-healing tests...');
  execSync('node test-scripts/spring-mvc-test-generator.js', { stdio: 'inherit' });
  
  // Step 3: Execute tests
  console.log('\n▶️  Step 3: Executing tests with self-healing...');
  execSync('node test-scripts/execute-tests.js', { stdio: 'inherit' });
  
  console.log('\n✅ All tests completed successfully!');
  
} catch (error) {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
}