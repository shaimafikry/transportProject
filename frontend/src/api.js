// const API_URL = 'http://localhost:5000';
// const API_URL = 'https://transportprojectbackend-production.up.railway.app';
const API_URL = 'adequate-jaquenette-shaima-b2cbba98.koyeb.app';

// Function to get the token
const getToken = () => sessionStorage.getItem('token');

// Reusable fetch function
const apiRequest = async (endpoint, method = 'GET', data = null, signal = null) => {
  const token = getToken(); // Get token dynamically
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }) // Add Authorization only if token exists
    },
    ...(data && { body: JSON.stringify(data) }), // Add body only if there's data
    ...(signal && { signal }) // Add abort signal if provided
  };

  try {
    const response = await fetch(`${API_URL}/${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData);
      console.log(errorData.message);
      throw new Error(errorData.error || errorData.message || "حدث خطأ أثناء معالجة الطلب");
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Re-throw abort errors
    }
    console.error(`Error in ${method} request:`, error);
    throw error;
  }
};

// API methods
export const fetchData = (endpoint, signal) => apiRequest(endpoint, 'GET', null, signal);
export const postData = (endpoint, data, signal) => apiRequest(endpoint, 'POST', data, signal);
export const putData = (endpoint, data, signal) => apiRequest(endpoint, 'PUT', data, signal);
export const deleteData = (endpoint, data, signal) => apiRequest(endpoint, 'DELETE', data, signal);
