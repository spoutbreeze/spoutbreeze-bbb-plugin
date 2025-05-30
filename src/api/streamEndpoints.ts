//import axios from "axios";

export interface StreamEndpointsRes {
  id: string;
  title: string;
  rtmp_url: string;
  stream_key: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const fetchStreamEndpoints = async (pluginApi: any): Promise<StreamEndpointsRes[]> => {
  try {
    console.log("Fetching cached stream endpoints...");
    
    const response = await pluginApi.getRemoteData('streamEndpoints');
    console.log("Response from getRemoteData:", response);
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    
    if (response.ok) {
      try {
        // Clone the response before reading to avoid body consumption issues
        const responseClone = response.clone();
        const data = await responseClone.json();
        console.log("Stream endpoints fetched successfully:", data);
        
        // Since your backend returns a direct array, handle it
        if (Array.isArray(data)) {
          return data;
        } else if (data.stream_endpoints && Array.isArray(data.stream_endpoints)) {
          return data.stream_endpoints;
        } else {
          console.warn("Unexpected data format:", data);
          return [];
        }
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        // Try to get the response as text to see what we're actually getting
        try {
          const textResponse = response.clone();
          const text = await textResponse.text();
          console.log("Response as text:", text);
          console.log("Response content-type:", response.headers.get('content-type'));
        } catch (textError) {
          console.error("Could not read response as text either:", textError);
        }
        throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
      }
    } else {
      console.error("Failed to fetch stream endpoints:", response.status, response.statusText);
      // Try to read the error response
      try {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
      } catch (e) {
        console.error("Could not read error response:", e);
      }
      throw new Error(`Failed to fetch stream endpoints: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching stream endpoints:", error);
    throw error;
  }
};
