import api from './axios'; 

export const fetchData = async () => {
  try {
    const response = await api.get('/your-endpoint'); // Replace with real endpoint
    console.log('Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
