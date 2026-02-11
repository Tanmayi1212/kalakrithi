/**
 * API Service Layer for Kalakrithi
 * Handles all API calls and data fetching
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - API response data
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
}

/**
 * Fetch Kalakrithi about page content
 * @returns {Promise<object>} Kalakrithi content data
 */
export async function getKalakrithiContent() {
  return fetchAPI('/kalakrithi');
}

/**
 * Fetch Arangetra about page content
 * @returns {Promise<object>} Arangetra content data
 */
export async function getArangetraContent() {
  return fetchAPI('/arangetra');
}

/**
 * Fetch featured artists/profiles
 * @returns {Promise<Array>} Array of artist profiles
 */
export async function getFeaturedArtists() {
  return fetchAPI('/artists/featured');
}

/**
 * Fetch all page content in a single call (optimized)
 * @returns {Promise<object>} Complete page data
 */
export async function getPageContent() {
  return fetchAPI('/content/home');
}

/**
 * Submit contact form or inquiry
 * @param {object} formData - Form submission data
 * @returns {Promise<object>} Response data
 */
export async function submitInquiry(formData) {
  return fetchAPI('/inquiries', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

/**
 * Fetch media content (videos, images)
 * @param {string} section - Section identifier (e.g., 'arangetra', 'kalakrithi')
 * @returns {Promise<object>} Media content data
 */
export async function getMediaContent(section) {
  return fetchAPI(`/media/${section}`);
}

/**
 * Fetch exhibition stalls data
 * @returns {Promise<Array>} Array of stall objects
 */
export async function getStalls() {
  return fetchAPI('/stalls');
}

/**
 * Fetch individual stall details by ID
 * @param {number|string} stallId - Stall ID
 * @returns {Promise<object>} Stall details
 */
export async function getStallById(stallId) {
  return fetchAPI(`/stalls/${stallId}`);
}
