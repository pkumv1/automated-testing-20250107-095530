const fs = require('fs');
const path = require('path');

// Load both analyses
const repoAnalysis = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../test-results/repository-analysis.json'), 'utf8')
);
const changeDetails = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../test-results/change-detection.json'), 'utf8')
);

// Combined analysis for test generation
const combinedAnalysis = {
  repository: repoAnalysis.repositoryAnalysis,
  changes: changeDetails,
  testingApproach: {
    framework: 'Spring MVC',
    language: 'Java',
    testingLibrary: 'JUnit 4.5',
    uiTesting: 'Selenium/Playwright for JSP pages',
    apiTesting: 'REST endpoints and DWR services',
    focusAreas: Object.keys(changeDetails).map(file => ({
      file,
      type: file.includes('Controller') ? 'controller' :
            file.includes('Service') ? 'service' :
            file.includes('DAO') ? 'data' :
            file.includes('.jsp') ? 'ui' : 'config',
      priority: file.includes('Controller') || file.includes('Service') ? 'high' : 'medium'
    }))
  },
  summary: {
    totalFiles: Object.keys(changeDetails).length,
    controllerChanges: 1,
    serviceChanges: 1,
    daoChanges: 1,
    uiChanges: 1,
    configChanges: 1
  }
};

// Save combined analysis
fs.writeFileSync(
  path.join(__dirname, '../test-results/combined-analysis.json'),
  JSON.stringify(combinedAnalysis, null, 2)
);

console.log('\nCombined Analysis Summary:');
console.log(`Repository: ${combinedAnalysis.repository.metrics.outputLanguage} application`);
console.log(`Stack: ${combinedAnalysis.repository.technical.frameworks.join(', ')}`);
console.log(`Changed components: ${combinedAnalysis.summary.totalFiles} files`);
console.log('Test focus: Modified controllers, services, and UI components');