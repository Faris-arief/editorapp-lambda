require("dotenv").config();

const HttpClient = require("../utils/httpClient");

/**
 * Authentication Service
 * Handles authentication-related API calls
 */
class AuthService {
  constructor() {
    this.accessToken = null;
    this.baseUrl =
      process.env.API_BASE_URL || "https://editorapp-be.fly.dev/api";
    this.credentials = {
      email: process.env.AUTH_EMAIL,
      password: process.env.AUTH_PASSWORD,
    };
  }

  /**
   * Sign in to get access token
   * @returns {Promise<string>} Access token
   * @throws {Error} If sign-in fails or token not found
   */
  async signIn() {
    try {
      console.log("Attempting to sign in...");

      const response = await HttpClient.post(
        `${this.baseUrl}/auth/signIn`,
        this.credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );

      console.log("Sign-in response status:", response.status);
      console.log("Sign-in response data:", response.data);

      // Check if request was successful
      if (response.status !== 200) {
        throw new Error(
          `Sign-in failed with status ${response.status}: ${response.statusText}`,
        );
      }

      // Parse response and extract access token
      const responseData = response.data;

      if (!responseData.success) {
        throw new Error(
          `Sign-in failed: ${responseData.message || "Unknown error"}`,
        );
      }

      const accessToken = responseData.data?.accessToken;

      if (!accessToken) {
        throw new Error("Access token not found in response");
      }

      console.log("Sign-in successful, access token obtained");
      this.accessToken = accessToken;
      return accessToken;
    } catch (error) {
      console.error("Sign-in error:", error.message);
      throw error;
    }
  }

  /**
   * Get authenticated headers with access token
   * @returns {Promise<Object>} Headers object with Authorization
   */
  async getAuthHeaders() {
    if (!this.accessToken) {
      this.accessToken = await this.signIn();
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint (relative to base URL)
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response
   */
  async authenticatedRequest(endpoint, options = {}) {
    try {
      const authHeaders = await this.getAuthHeaders();
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${this.baseUrl}${endpoint}`;

      const requestOptions = {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers,
        },
      };

      return await HttpClient.request({
        url,
        ...requestOptions,
      });
    } catch (error) {
      console.error("Authenticated request error:", error.message);
      throw error;
    }
  }
}

module.exports = AuthService;
