// Public API Service for PublicUser role
const API_BASE_URL = 'http://localhost:5000/api/public';

class PublicApiService {
  
  /**
   * Register a new public user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} API response
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  }

  /**
   * Login public user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} API response with token
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      // If login successful, store token and user data
      if (result.success && result.data) {
        this.setToken(result.data.token);
        this.setCurrentUser(result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} API response
   */
  async updateProfile(profileData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update profile API error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} API response
   */
  async changePassword(passwordData) {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      });
      return await response.json();
    } catch (error) {
      console.error('Change password API error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  }

  /**
   * Get tank data for user's location
   * @returns {Promise<Object>} Tank data and summary
   */
  async getTankData() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/tank-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Get tank data API error:', error);
      throw error;
    }
  }

  /**
   * Get filtered water management data based on user's reservoir details
   * @returns {Promise<Object>} Filtered tanks, canals, and schedules data
   */
  async getWaterManagementData() {
    try {
      const token = this.getToken();
      const user = this.getCurrentUser();
      
      // Get user's reservoir details
      const reservoirFilter = {
        nameOfReservoir: user?.nameOfReservoir,
        range: user?.range,
        division: user?.division,
        scheme: user?.scheme
      };

      // Fetch all data types for the user's reservoir
      const [tanksResponse, canalsResponse, schedulesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/tanks?reservoir=${encodeURIComponent(reservoirFilter.nameOfReservoir)}&range=${encodeURIComponent(reservoirFilter.range)}&division=${encodeURIComponent(reservoirFilter.division)}&scheme=${encodeURIComponent(reservoirFilter.scheme)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/canals?reservoir=${encodeURIComponent(reservoirFilter.nameOfReservoir)}&range=${encodeURIComponent(reservoirFilter.range)}&division=${encodeURIComponent(reservoirFilter.division)}&scheme=${encodeURIComponent(reservoirFilter.scheme)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/schedules?reservoir=${encodeURIComponent(reservoirFilter.nameOfReservoir)}&range=${encodeURIComponent(reservoirFilter.range)}&division=${encodeURIComponent(reservoirFilter.division)}&scheme=${encodeURIComponent(reservoirFilter.scheme)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [tanksData, canalsData, schedulesData] = await Promise.all([
        tanksResponse.json(),
        canalsResponse.json(),
        schedulesResponse.json()
      ]);

      return {
        success: true,
        data: {
          tanks: tanksData.success ? tanksData.data?.tanks || [] : [],
          canals: canalsData.success ? canalsData.data?.canals || [] : [],
          schedules: schedulesData.success ? schedulesData.data?.schedules || [] : [],
          reservoirFilter
        }
      };
    } catch (error) {
      console.error('Get water management data API error:', error);
      
      // Return fallback data based on user's reservoir details
      const user = this.getCurrentUser();
      const reservoirDetails = {
        nameOfReservoir: user?.nameOfReservoir || 'Unknown Reservoir',
        range: user?.range || 'Unknown Range',
        division: user?.division || 'Unknown Division',
        scheme: user?.scheme || 'Unknown Scheme'
      };

      return {
        success: false,
        data: {
          tanks: [{
            id: '1',
            name: reservoirDetails.nameOfReservoir,
            range: reservoirDetails.range,
            division: reservoirDetails.division,
            scheme: reservoirDetails.scheme,
            fullCapacity: 100000,
            availabilityCapacity: 75000,
            availabilityPercentage: 75,
            status: 'active',
            lastUpdateDate: new Date().toISOString(),
            lastUpdatedBy: { firstName: 'System', lastName: 'Admin', role: 'EA' }
          }],
          canals: [{
            id: '1',
            canalName: `Main Canal - ${reservoirDetails.nameOfReservoir}`,
            type: 'main',
            canal: 'open',
            flowRate: 25.5,
            sluiceOpeningSize: 3.5,
            startDay: '2025-08-10',
            endDay: '2025-12-31',
            associatedReservoir: reservoirDetails.nameOfReservoir,
            range: reservoirDetails.range,
            division: reservoirDetails.division,
            scheme: reservoirDetails.scheme,
            assignedFA: [{ firstName: 'System', lastName: 'FA' }],
            assignedIrrigators: [{ firstName: 'System', lastName: 'Irrigator' }]
          }],
          schedules: [{
            id: '1',
            title: `Water Distribution - ${reservoirDetails.nameOfReservoir}`,
            description: `Regular water distribution schedule for ${reservoirDetails.nameOfReservoir}`,
            startDate: '2025-08-10',
            endDate: '2025-08-31',
            status: 'Active',
            waterAllocation: 50000,
            associatedReservoir: reservoirDetails.nameOfReservoir,
            range: reservoirDetails.range,
            division: reservoirDetails.division,
            scheme: reservoirDetails.scheme
          }],
          reservoirFilter: reservoirDetails
        }
      };
    }
  }

  /**
   * Helper method to get auth token from localStorage
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Helper method to set auth token in localStorage
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem('token', token);
  }

  /**
   * Helper method to remove auth token from localStorage
   */
  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Helper method to check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic token expiry check (decode JWT payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper method to get current user from localStorage
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Helper method to set current user in localStorage
   * @param {Object} user - User data
   */
  setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Helper method to clear all auth data
   */
  clearAuthData() {
    this.removeToken();
    localStorage.removeItem('user');
  }

  /**
   * Logout user
   * @returns {Promise<Object>} API response
   */
  async logout() {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      // Clear local auth data regardless of API response
      this.clearAuthData();
      
      return await response.json();
    } catch (error) {
      // Still clear local data even if API call fails
      this.clearAuthData();
      console.error('Logout API error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new PublicApiService();
