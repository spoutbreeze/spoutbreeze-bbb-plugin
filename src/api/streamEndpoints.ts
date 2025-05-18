import axios from "axios";
import { API_URL } from '../../config'

export interface StreamEndpointsRes {
  id: string;
  title: string;
  rtmp_url: string;
  stream_key: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const fetchStreamEndpoints = async (): Promise<StreamEndpointsRes[]> => {
  try {
    // Try to get token from URL parameters
    // const urlParams = new URLSearchParams(window.location.search);
    // const tokenFromUrl = urlParams.get("access_token");

    // // Try local storage as fallback
    // const tokenFromStorage = localStorage.getItem("access_token");

    // // Use whichever token is available
    // const token = tokenFromUrl || tokenFromStorage;

    // if (!token) {
    //   throw new Error("No authentication token available");
    // }
    const response = await axios.get<StreamEndpointsRes[]>(
      `${API_URL}/api/stream-endpoint/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnNHZlcXI2eXE2ckU3YjhSQndPa1Nib05HWnc0Yjd6blBSb2R2UlZXVWdNIn0.eyJleHAiOjE3NDc0OTgwNDEsImlhdCI6MTc0NzQ4MDA0MSwianRpIjoiMjA4YzI2NTUtYTA1ZS00ZWY0LWIzMmYtMTY4Y2I5MjE2NzA2IiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9zcG91dGJyZWV6ZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1OTE0NmYxNS1lYTAxLTQwMDktYjcwMi05ZWUwZTk3YjBlMWMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzcG91dGJyZWV6ZUFQSSIsInNpZCI6IjVlYTgxNzhiLWU2MjItNDRhNS1iZmZkLWRlZjE3YjZlYWQ3MCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXNwb3V0YnJlZXplIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcm9sZXMgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiZmlyYXMgYmVuIHNhaWQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJmaXJhc0B0ZXN0LmNvbSIsImdpdmVuX25hbWUiOiJmaXJhcyIsImZhbWlseV9uYW1lIjoiYmVuIHNhaWQiLCJlbWFpbCI6ImZpcmFzQHRlc3QuY29tIn0.TFQmCCRNbbt7VUbTYw1_q2M09Cs5wYu5S7j5N3ogJA9pjEraWp4xyPj94CfigPMS_e2g0v5z2QiOXDUtDePSJoK6xgFCbDLobBIkokHBkXEJQTyONopB8hv60Ia2iMLDkp8zsPcXgszx7Rv3gxH-JsYRSLLdMwpbCaYw1rIB1_aoiG4aC43Kv52f364CjNo9X1z7RS0jx8-gIaaDsqbIFinM9f6jadzADhBP2tREZ6vtyyHaPut1TZx7K-FYL2uSHc2CYaihDiq8MjXWCz-oM93ElEmJAM0gORyIsELwuoR1qxEuTdmUlbLMlvdkeXRxGgcKLpVCqBCtILZ5ygSwCg`,
        },
      }
    );

    if (response.status === 200) {
      console.log("Stream endpoints fetched successfully:", response.data);
      return response.data;
    } else {
      console.error("Failed to fetch stream endpoints:", response.statusText);
      throw new Error(
        `Failed to fetch stream endpoints: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error fetching stream endpoints:", error);
    throw error;
  }
};
