// lib/debug-helpers.js
export const logApiError = async (response) => {
    try {
      // Try to get the response content in multiple formats
      const text = await response.clone().text();
      console.error("API Response Text:", text);
      
      try {
        const json = await response.clone().json();
        console.error("API Response JSON:", json);
      } catch (jsonError) {
        console.error("Response is not valid JSON");
      }
      
      console.error("Response status:", response.status);
      console.error("Response headers:", Object.fromEntries([...response.headers]));
    } catch (error) {
      console.error("Could not parse response:", error);
    }
  };