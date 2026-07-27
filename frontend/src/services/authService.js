import api from "../api/axios";
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  removeTokens,
} from "../utils/tokenStorage";

const authService = {
  /**
   * Register a new student user.
   * @param {Object} userData
   * @returns {Promise<Object>} Backend response data
   */
  register: async (userData) => {
    try {
      const response = await api.post("auth/register/", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Log in user and save tokens.
   * @param {Object} credentials
   * @returns {Promise<Object>} Backend response data
   */
  login: async (credentials) => {
    try {
      const response = await api.post("auth/login/", credentials);
      if (response.data && response.data.success) {
        const { access, refresh } = response.data.data.tokens;
        saveTokens(access, refresh);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Retrieve authenticated user profile.
   * @returns {Promise<Object>} Backend response data
   */
  getProfile: async () => {
    try {
      const response = await api.get("auth/profile/", {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update authenticated user profile.
   * @param {Object|FormData} profileData
   * @returns {Promise<Object>} Backend response data
   */
  updateProfile: async (profileData) => {
    try {
      const isFormData = profileData instanceof FormData;
      const headers = {
        Authorization: `Bearer ${getAccessToken()}`,
      };
      
      if (isFormData) {
        headers["Content-Type"] = "multipart/form-data";
      }

      const response = await api.put("auth/profile/update/", profileData, {
        headers,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change password for the authenticated user.
   * @param {Object} passwordData
   * @returns {Promise<Object>} Backend response data
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.post("auth/change-password/", passwordData, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Log out the authenticated user by blacklisting their refresh token.
   * Stored tokens are cleared locally regardless of request success/failure.
   * @returns {Promise<Object>} Backend response data
   */
  logout: async () => {
    const refreshToken = getRefreshToken();
    try {
      const response = await api.post(
        "auth/logout/",
        { refresh: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      removeTokens();
    }
  },
};

export default authService;
