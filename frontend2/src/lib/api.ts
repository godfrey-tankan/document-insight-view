import axios from 'axios'


const api = axios.create({
  baseURL: 'http://localhost:8000/api/auth/',
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
export const registerUser = (data) => api.post('register/', data)
export const loginUser = (data) => api.post('login/', data)

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

export default api