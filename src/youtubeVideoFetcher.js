import { google } from 'googleapis';
const youtube = google.youtube('v3');

export const getLatestVideo = async (channelId) => {
  const auth = process.env.YOUTUBE_API_KEY;
  
  try {
    const response = await youtube.search.list({
      key: auth,
      channelId: channelId,
      part: 'snippet',
      order: 'date',
      maxResults: 1,
      type: 'video'
    });

    if (response.data.items.length === 0) {
      return [];
    }

    const latestVideo = response.data.items[0];
    return [{
      id: latestVideo.id.videoId,
      title: latestVideo.snippet.title,
      description: latestVideo.snippet.description,
      publishedAt: latestVideo.snippet.publishedAt
    }];
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
}; 