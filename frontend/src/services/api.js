/**
 * BA Copilot - API Service
 * =========================
 * Connects React frontend to FastAPI backend
 * FIXED: Proper data passing for story generation
 */

import axios from 'axios';

// API Base URL - pulls from environment or localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('🌐 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes for FREE models (they can be slower)
});

// Response Interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || "Network Error";
    console.error("❌ API Error:", message);
    console.error("Full error:", error.response?.data);
    return Promise.reject(new Error(message));
  }
);

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
// REQUIREMENTS API
// ========================================
export const requirementsApi = {
  extract: (inputId, projectType = 'General', industry = 'General') => 
    apiClient.post('/api/requirements/extract', { 
      input_id: inputId,
      project_type: projectType,
      industry: industry
    }),
  
  get: (inputId) => apiClient.get(`/api/requirements/${inputId}`)
};

// ========================================
// STORIES API - FIXED
// ========================================
export const storiesApi = {
  // FIXED: Properly format requirements data for backend
  generate: (requirementsData, projectType = 'General') => {
    console.log('📖 Generating stories with data:', requirementsData);
    
    // Check if requirementsData has the input_id
    if (!requirementsData || typeof requirementsData !== 'object') {
      throw new Error('Invalid requirements data');
    }
    
    // The backend expects input_id, not the full requirements
    // But we also need to pass the requirements as context
    const payload = {
      input_id: requirementsData.input_id || 0,
      project_type: projectType
    };
    
    console.log('Sending payload:', payload);
    
    return apiClient.post('/api/stories/generate', payload);
  },
  
  exportJira: (storiesData) => {
    console.log('Exporting to JIRA:', storiesData);
    return apiClient.post('/api/stories/export/jira', { stories: storiesData });
  },
  
  get: (inputId) => apiClient.get(`/api/stories/${inputId}`)
};

// ========================================
// CRITERIA API
// ========================================
export const criteriaApi = {
  generate: (storyId, userStoryText) => {
    console.log('✅ Generating criteria for story:', storyId);
    return apiClient.post('/api/criteria/generate', { 
      story_id: storyId, 
      user_story: userStoryText 
    });
  },
  
  exportGherkin: (criteriaData, featureName = 'User Story') =>
    apiClient.post('/api/criteria/export/gherkin', {
      criteria: criteriaData,
      feature_name: featureName
    })
};

// ========================================
// AUDIO API (Not used - browser handles transcription)
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