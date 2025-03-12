CREATE TABLE processed_videos (
  video_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  published_at DATETIME NOT NULL,
  processed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
