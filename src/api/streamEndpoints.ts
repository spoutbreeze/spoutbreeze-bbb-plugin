import axios from "axios";

export interface StreamEndpointsRes {
  id: string;
  title: string;
  rtmp_url: string;
  stream_key: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const API_URL = process.env.API_URL;

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
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnNHZlcXI2eXE2ckU3YjhSQndPa1Nib05HWnc0Yjd6blBSb2R2UlZXVWdNIn0.eyJleHAiOjE3NDgzNTI4NDUsImlhdCI6MTc0ODMzNDg0NSwiYXV0aF90aW1lIjoxNzQ4MzM0ODQ1LCJqdGkiOiI2M2ViM2IyNi0zNWFmLTRlN2ItOThjZi0yODZhMWI3YjgyYzMiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL3Nwb3V0YnJlZXplIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjU5MTQ2ZjE1LWVhMDEtNDAwOS1iNzAyLTllZTBlOTdiMGUxYyIsInR5cCI6IkJlYXJlciIsImF6cCI6InNwb3V0YnJlZXplQVBJIiwic2lkIjoiNzcxNWZhZGItOTU1Ni00NzJhLWJhMWItZGE2NjViODBiNTQ2IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtc3BvdXRicmVlemUiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCByb2xlcyBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJmaXJhcyBiZW4gc2FpZCIsInByZWZlcnJlZF91c2VybmFtZSI6ImZpcmFzQHRlc3QuY29tIiwiZ2l2ZW5fbmFtZSI6ImZpcmFzIiwiZmFtaWx5X25hbWUiOiJiZW4gc2FpZCIsImVtYWlsIjoiZmlyYXNAdGVzdC5jb20ifQ.Rdi7juZ0mWB5oCyNLgsUzhKXzcC4PZouC1fdqy8mBHVNXS_5mdyMnafjLcx4e3-Nvjdrdluaz18RIIL1EQLe_pNlOIPKKphCfsjLjcQo0TBTMyJb8fb2gowpChKEEPvDkQOldbcbeug41XFWGTupf5mafi0_sHg2U8PsDZga8-wDE1FtSMqU7pGLIeK6ya4jMb3fyFjgaSjrLjuJ_jMmRI-WQzFLJR4heIANCETf8Ga6P2apPTDPWhfYTv6fpWRI0RVSR42kUS9K8ZGSontHyuuDLtRFGZC-3mhQ9orRNO4vTHukPf5P6nzi1MHZoZ6xnvmzy4zoLlIXJm9be6EMvQ`,
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
