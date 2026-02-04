require("dotenv").config();

const HttpClient = require("../utils/httpClient");
const AuthService = require("./authService");

/**
 * API Service
 * Main service class for making API calls to EditorApp backend
 */
class ApiService {
  constructor() {
    this.authService = new AuthService();
    this.baseUrl = process.env.API_BASE_URL;
  }

  /**
   * Get access token
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    return await this.authService.signIn();
  }

  /**
   * Make an authenticated request to any endpoint
   * @param {string} endpoint - API endpoint (e.g., '/users', '/stores')
   * @param {Object} options - Request options (method, body, etc.)
   * @returns {Promise<Object>} API response
   */
  async request(endpoint, options = {}) {
    return await this.authService.authenticatedRequest(endpoint, options);
  }

  /**
   * Example: Get user profile
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      const response = await this.request("/user/profile");
      return response.data;
    } catch (error) {
      console.error("Get user profile error:", error.message);
      throw error;
    }
  }

  /**
   * Example: Get stores
   * @returns {Promise<Array>} List of stores
   */
  async getStores() {
    try {
      const response = await this.request("/stores");
      return response.data;
    } catch (error) {
      console.error("Get stores error:", error.message);
      throw error;
    }
  }

  /**
   * Make a direct HTTP request (without authentication)
   * @param {string} url - Full URL
   * @param {Object} options - Request options
   * @returns {Promise<Object>} HTTP response
   */
  async directRequest(url, options = {}) {
    return await HttpClient.request({ url, ...options });
  }
}

module.exports = ApiService;
