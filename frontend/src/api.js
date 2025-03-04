// const API_URL = 'http://localhost:5000';
const API_URL = 'https://transportprojectbackend-production.up.railway.app';

// Function to get the token
const getToken = () => sessionStorage.getItem('token');

// Reusable fetch function
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const token = getToken(); // Get token dynamically
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }) // Add Authorization only if token exists
    },
    ...(data && { body: JSON.stringify(data) }) // Add body only if there's data
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
    console.error(`Error in ${method} request:`, error);
    throw new Error(error.message || "حدث خطأ أثناء معالجة الطلب");
  }
};

// API methods
export const fetchData = (endpoint) => apiRequest(endpoint);
export const postData = (endpoint, data) => apiRequest(endpoint, 'POST', data);
export const putData = (endpoint, data) => apiRequest(endpoint, 'PUT', data);
export const deleteData = (endpoint, data) => apiRequest(endpoint, 'DELETE', data);
