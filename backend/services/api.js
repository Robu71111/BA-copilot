/**
 * BA Copilot - API Service
 * =========================
 * FIXED: Lower timeout (90s), smarter retry, correct JIRA payload
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds — backend tries multiple models within this window
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
 * Retry wrapper — retries once after 3s on timeout or 5xx errors.
 * Does NOT retry on 4xx (client errors) or if error contains "All models failed".
 */
async function withRetry(fn) {
  try {
    return await fn();
  } catch (error) {
    const msg = error?.message || '';
    // Don't retry if all models already exhausted on the backend
    if (msg.includes('All models failed') || msg.includes('All') ) {
      throw error;
    }
    const status = error?.response?.status;
    if (status && status >= 400 && status < 500) {
      throw error;
    }
    // Only retry on timeout or 5xx
    console.log('Request failed, retrying in 3s...');
    await new Promise(r => setTimeout(r, 3000));
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