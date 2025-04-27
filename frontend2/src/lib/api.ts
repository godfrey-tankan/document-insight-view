import axios from 'axios'


const api = axios.create({
  baseURL: 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json'
  }
})

export function logoutUser() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  window.location.href = '/login'

};
// Auth API
export const registerUser = (data) => api.post('api/auth/register/', data)
export const loginUser = (data) => api.post('api/auth/login/', data)

// Add interceptors for JWT handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token refresh here
    }
    return Promise.reject(error)
  }
)

export const analyzeDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post('api/analyze/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });
  return response.data;
};

export default api