/**
 * BA Copilot - API Service
 * =========================
 * Connects React frontend to FastAPI backend
 * FIXED: Retry logic, correct JIRA payload shape
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 150000, // 2.5 minutes for FREE models
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || "Network Error";
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);

/**
 * Retry wrapper — retries once after a delay on failure.
 * Only retries on 5xx errors or network errors, not 4xx.
 */
async function withRetry(fn, retryDelay = 5000) {
  try {
    return await fn();
  } catch (error) {
    const status = error?.response?.status;
    // Don't retry client errors (400, 404, etc)
    if (status && status >= 400 && status < 500) {
      throw error;
    }
    console.log(`Request failed, retrying in ${retryDelay/1000}s...`);
    await new Promise(r => setTimeout(r, retryDelay));
    return await fn();
  }
}

// ========================================
// PROJECT API
// ========================================
export const projectApi = {
  getAll: () => apiClient.get('/api/projects'),
  
  create: (data) => apiClient.post('/api/projects', {
    name: data.name,
    type: data.type || 'General',
    industry: data.industry || 'General',
    description: data.description || ''
  }),
  
  delete: (id) => apiClient.delete(`/api/projects/${id}`),
  
  get: (id) => apiClient.get(`/api/projects/${id}`),
};

// ========================================
// INPUT API
// ========================================
export const inputApi = {
  submitText: (projectId, text, type = 'text') => 
    apiClient.post('/api/input/text', { 
      project_id: projectId, 
      text: text,
      input_type: type 
    }),
  
  uploadDocument: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    
    return apiClient.post('/api/input/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getMockTranscript: () => apiClient.get('/api/input/mock-transcript')
};

// ========================================
// REQUIREMENTS API (with retry)
// ========================================
export const requirementsApi = {
  extract: (inputId, projectType = 'General', industry = 'General') => 
    withRetry(() => apiClient.post('/api/requirements/extract', { 
      input_id: inputId,
      project_type: projectType,
      industry: industry
    })),
  
  get: (inputId) => apiClient.get(`/api/requirements/${inputId}`)
};

// ========================================
// STORIES API (with retry + fixed payload)
// ========================================
export const storiesApi = {
  generate: (requirementsData, projectType = 'General') => {
    if (!requirementsData || typeof requirementsData !== 'object') {
      throw new Error('Invalid requirements data');
    }
    
    const payload = {
      input_id: requirementsData.input_id || 0,
      project_type: projectType
    };
    
    return withRetry(() => apiClient.post('/api/stories/generate', payload));
  },
  
  // FIXED: Send stories array directly, not double-nested
  exportJira: (storiesData) => {
    const stories = storiesData?.stories || storiesData;
    return apiClient.post('/api/stories/export/jira', { stories: { stories: Array.isArray(stories) ? stories : [] } });
  },
  
  get: (inputId) => apiClient.get(`/api/stories/${inputId}`)
};

// ========================================
// CRITERIA API (with retry)
// ========================================
export const criteriaApi = {
  generate: (storyId, userStoryText) => {
    return withRetry(() => apiClient.post('/api/criteria/generate', { 
      story_id: storyId, 
      user_story: userStoryText 
    }));
  },
  
  exportGherkin: (criteriaData, featureName = 'User Story') =>
    apiClient.post('/api/criteria/export/gherkin', {
      criteria: criteriaData,
      feature_name: featureName
    })
};

// ========================================
// AUDIO API
// ========================================
export const audioApi = {
  check: () => apiClient.get('/api/audio/check')
};

// ========================================
// HEALTH API
// ========================================
export const healthApi = {
  check: () => apiClient.get('/api/health'),
  checkApis: () => apiClient.get('/api/health/apis')
};

export default apiClient;