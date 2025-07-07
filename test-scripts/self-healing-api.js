const axios = require('axios');

class SelfHealingAPI {
  constructor(baseURL = 'http://localhost:8080') {
    this.baseURL = baseURL;
    this.endpoints = {
      primary: {},
      fallback: {},
      discovered: {}
    };
  }

  async testEndpoint(config, changeLocations) {
    const { endpoint, method, data, params } = config;
    
    // Try primary endpoint
    try {
      const response = await axios({
        url: `${this.baseURL}${endpoint}`,
        method,
        data,
        params,
        timeout: 5000
      });
      return { success: true, response: response.data, healing: false };
    } catch (error) {
      // Attempt self-healing
      return await this.healEndpoint(config, error);
    }
  }

  async healEndpoint(config, error) {
    const { endpoint, method } = config;
    
    // Strategy 1: Try common Spring MVC patterns
    const variations = [
      endpoint,
      endpoint.replace(/\//, '/api/'),
      endpoint.replace(/\//, '/rest/'),
      endpoint + '.do',  // Legacy Spring pattern
      endpoint + '.action'  // Struts-like pattern
    ];
    
    for (const variant of variations) {
      try {
        const response = await axios({
          ...config,
          url: `${this.baseURL}${variant}`,
          timeout: 3000
        });
        
        // Remember successful endpoint
        this.endpoints.discovered[endpoint] = variant;
        return { 
          success: true, 
          response: response.data, 
          healing: true,
          healedEndpoint: variant 
        };
      } catch (e) {
        continue;
      }
    }
    
    // Strategy 2: For DWR endpoints
    if (endpoint.includes('dwr')) {
      return await this.testDWREndpoint(config);
    }
    
    return { success: false, error: error.message, healing: 'failed' };
  }

  async testDWREndpoint(config) {
    // DWR specific handling for the repository
    const dwrUrl = `${this.baseURL}/dwr/call/plaincall/${config.service}.${config.method}.dwr`;
    
    try {
      const response = await axios.post(dwrUrl, {
        callCount: 1,
        page: config.page || '/index.jsp',
        httpSessionId: '',
        scriptSessionId: '',
        c0: {
          scriptName: config.service,
          methodName: config.method,
          params: config.data
        }
      });
      
      return { success: true, response: response.data, healing: 'dwr-adapted' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

module.exports = SelfHealingAPI;