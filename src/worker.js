import { getLatestVideos } from './youtubeVideoFetcher.mjs';
import { summarizeVideo } from './difyWorkflowExecutor.mjs';

export default {
  // Cronトリガーで実行される関数
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(postVideoSummaryToSlack(env));
  },

  // HTTP経由で実行される関数
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // ヘルスチェックエンドポイント
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }
    
    // 手動実行エンドポイント
    if (url.pathname === '/post-video-summary-to-slack' && request.method === 'POST') {
      ctx.waitUntil(postVideoSummaryToSlack(env));
      return new Response('Processing started', { status: 202 });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

async function postVideoSummaryToSlack(env) {
  try {
    const channelId = env.YOUTUBE_CHANNEL_ID;
    
    if (!channelId) {
      throw new Error('YouTube Channel ID is not configured');
    }

    // 最新の動画を取得
    const latestVideos = await getLatestVideos(channelId, env);
    
    if (latestVideos.length === 0) {
      console.log('No new videos found');
      return;
    }

    console.log(`Found ${latestVideos.length} new videos`);
    
    for (const video of latestVideos) {
      try {
        // 処理済みチェック
        const { results } = await env.DB.prepare(
          'SELECT 1 FROM processed_videos WHERE video_id = ?'
        ).bind(video.id).all();
        
        if (results.length > 0) {
          console.log(`Video ${video.id} already processed, skipping...`);
          continue;
        }

        console.log(`Processing video: ${video.title} (${video.id})`);
        
        const result = await summarizeVideo(video, env.DIFY_API_KEY);
        console.log('Dify workflow completed:', result);

        // 処理完了を記録
        await env.DB.prepare(
          'INSERT INTO processed_videos (video_id, title, published_at) VALUES (?, ?, ?)'
        ).bind(video.id, video.title, video.publishedAt).run();
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        continue;
      }
    }
    
    console.log('Successfully processed all videos');
  } catch (error) {
    console.error('Error in processVideos:', error);
    throw error;
  }
}
