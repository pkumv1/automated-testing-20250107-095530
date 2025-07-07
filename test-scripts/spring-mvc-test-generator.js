const fs = require('fs');
const path = require('path');

// Load repository analysis and changes
const repoAnalysis = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../test-results/repository-analysis.json'), 'utf8')
);
const changes = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../test-results/change-detection.json'), 'utf8')
);

class SpringMVCTestGenerator {
  generateControllerTests(controllerFile, changedFunctions) {
    const tests = [];
    
    // UserController tests
    if (controllerFile.includes('UserController')) {
      tests.push({
        name: 'test_saveUser_validation',
        endpoint: '/user/save',
        method: 'POST',
        data: { username: 'testuser', email: 'test@example.com' },
        expectedStatus: 200,
        targetFunction: 'saveUser',
        linesCovered: changedFunctions.lines.modified
      });
      
      tests.push({
        name: 'test_updateUser_authorization',
        endpoint: '/user/update',
        method: 'PUT',
        data: { id: 1, username: 'updateduser' },
        expectedStatus: 200,
        targetFunction: 'updateUser',
        linesCovered: changedFunctions.lines.modified
      });
      
      tests.push({
        name: 'test_validateUserInput_newFunction',
        endpoint: '/user/validate',
        method: 'POST',
        data: { username: 'test123', password: 'Pass@123' },
        expectedStatus: 200,
        targetFunction: 'validateUserInput',
        linesCovered: changedFunctions.lines.added
      });
    }
    
    // ReportController tests
    if (controllerFile.includes('ReportController')) {
      tests.push({
        name: 'test_exportToExcel_functionality',
        endpoint: '/report/export/excel',
        method: 'GET',
        params: { format: 'xlsx', startDate: '2025-01-01' },
        expectedStatus: 200,
        expectedContentType: 'application/vnd.ms-excel',
        targetFunction: 'exportToExcel',
        linesCovered: changedFunctions.lines.modified
      });
    }
    
    return tests;
  }

  generateServiceTests(serviceFile, changedFunctions) {
    const tests = [];
    
    if (serviceFile.includes('RTSService')) {
      tests.push({
        name: 'test_processRequest_logic',
        method: 'processRequest',
        input: { requestType: 'USER_UPDATE', data: {} },
        expectedBehavior: 'Process request and return status',
        linesCovered: changedFunctions.lines.modified
      });
      
      tests.push({
        name: 'test_generateReport_performance',
        method: 'generateReport',
        input: { reportType: 'MONTHLY', userId: 1 },
        expectedBehavior: 'Generate report within 5 seconds',
        linesCovered: changedFunctions.lines.added
      });
    }
    
    return tests;
  }

  generateDAOTests(daoFile, changedFunctions) {
    const tests = [];
    
    if (daoFile.includes('UserDAO')) {
      tests.push({
        name: 'test_findByUsername_query',
        method: 'findByUsername',
        input: 'testuser',
        expectedQuery: 'SELECT u FROM User u WHERE u.username = :username',
        linesCovered: changedFunctions.lines.modified
      });
      
      tests.push({
        name: 'test_updateLastLogin_newMethod',
        method: 'updateLastLogin',
        input: { userId: 1, timestamp: new Date() },
        expectedBehavior: 'Update last_login timestamp',
        linesCovered: changedFunctions.lines.added
      });
    }
    
    return tests;
  }

  generateUITests(jspFile, changedComponents) {
    const tests = [];
    
    if (jspFile.includes('userForm.jsp')) {
      tests.push({
        name: 'test_userForm_validation',
        url: '/user/form',
        elements: [
          { id: 'username', validation: 'required' },
          { id: 'email', validation: 'email format' },
          { id: 'submitBtn', action: 'click' }
        ],
        expectedBehavior: 'Form validates and submits',
        linesCovered: changedComponents.lines.added
      });
    }
    
    return tests;
  }
}

// Generate all tests
const generator = new SpringMVCTestGenerator();
const allTests = {
  controllers: [],
  services: [],
  daos: [],
  ui: []
};

// Process each changed file
for (const [file, changeInfo] of Object.entries(changes.changedFiles)) {
  if (file.includes('Controller')) {
    allTests.controllers.push(...generator.generateControllerTests(file, changeInfo));
  } else if (file.includes('Service')) {
    allTests.services.push(...generator.generateServiceTests(file, changeInfo));
  } else if (file.includes('DAO')) {
    allTests.daos.push(...generator.generateDAOTests(file, changeInfo));
  } else if (file.includes('.jsp')) {
    allTests.ui.push(...generator.generateUITests(file, changeInfo));
  }
}

// Save generated tests
fs.writeFileSync(
  path.join(__dirname, '../test-results/generated-tests.json'),
  JSON.stringify(allTests, null, 2)
);

console.log('Test Generation Complete:');
console.log(`- Controller tests: ${allTests.controllers.length}`);
console.log(`- Service tests: ${allTests.services.length}`);
console.log(`- DAO tests: ${allTests.daos.length}`);
console.log(`- UI tests: ${allTests.ui.length}`);
console.log(`Total: ${allTests.controllers.length + allTests.services.length + allTests.daos.length + allTests.ui.length} tests`);

module.exports = allTests;