import axios from 'axios';
import { API_URL } from '../../config'

export interface BroadcasterReq {
    meeting_id: string;
    rtmp_url: string;
    stream_key: string;
    password: string;
}

export const startStream = async (payload: BroadcasterReq
) => {
    try {
        const response = await axios.post(`${API_URL}/api/bbb/broadcaster`, payload);
        if (response.status === 200) {
            console.log("Stream started successfully:", response.data);
            return response.data;
        } else {
            console.error("Failed to start stream:", response.statusText);
            throw new Error(`Failed to start stream: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error starting stream:", error);
    }
}
