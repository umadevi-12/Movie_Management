import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Movie API endpoints
export const movieAPI = {
  // Get all movies
  getAllMovies: async () => {
    try {
      const response = await api.get('/movies');
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  // Get single movie by ID
  getMovieById: async (id) => {
    try {
      const response = await api.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie ${id}:`, error);
      throw error;
    }
  },

  // Create new movie
  createMovie: async (movieData) => {
    try {
      const response = await api.post('/movies', movieData);
      return response.data;
    } catch (error) {
      console.error('Error creating movie:', error);
      throw error;
    }
  },

  // Update movie
  updateMovie: async (id, movieData) => {
    try {
      const response = await api.put(`/movies/${id}`, movieData);
      return response.data;
    } catch (error) {
      console.error(`Error updating movie ${id}:`, error);
      throw error;
    }
  },

  // Delete movie
  deleteMovie: async (id) => {
    try {
      const response = await api.delete(`/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting movie ${id}:`, error);
      throw error;
    }
  },

  // Search movies
  searchMovies: async (query) => {
    try {
      const response = await api.get(`/movies/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }
};

export default api;