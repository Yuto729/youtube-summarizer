import { getLatestVideo } from './youtubeVideoFetcher.js';
import { summarizeVideo } from './difyWorkflowExecutor.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const youtubeSummaryBot = async () => {
  try {
    // 環境変数から YouTube チャンネル ID を取得
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    
    if (!channelId) {
      console.error('YouTube Channel ID is not configured');
      return;
    }

    // 最新の動画を取得
    const videos = await getLatestVideo(channelId);
    
    if (videos.length === 0) {
      console.log('No new videos found');
      return;
    }

    console.log(`Found ${videos.length} new videos`);
    
    for (const video of videos) {
      console.log(`Processing video: ${video.title} (${video.id})`);
      
      const result = await summarizeVideo(video);
      console.log('Dify workflow completed:', result);
    }
    
    console.log('Successfully processed all videos');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ボットを実行
youtubeSummaryBot();