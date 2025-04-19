import axios from 'axios';

export interface BroadcasterReq {
    meeting_id: string;
    rtmp_url: string;
    stream_key: string;
    password: string;
}

export const startStream = async (payload: BroadcasterReq
) => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/bbb/broadcaster', payload);
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
