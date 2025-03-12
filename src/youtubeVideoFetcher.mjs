export const getLatestVideos = async (channelId, env, maxResults = 1) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `key=${env.YOUTUBE_API_KEY}&` +
      `channelId=${channelId}&` +
      `part=snippet&` +
      `order=date&` +
      `maxResults=${maxResults}&` +
      `type=video`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`YouTube API Error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();

    if (!data.items?.length) {
      return [];
    }

    return data.items.map(video => ({
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
}; 