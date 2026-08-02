CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  release_date TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('music-video', 'japanese-music-video', 'performance', 'practice', 'behind')),
  era TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS videos_release_date_idx ON videos(release_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS videos_single_featured_idx ON videos(featured) WHERE featured = 1;

INSERT OR IGNORE INTO videos (youtube_id, title, release_date, kind, era, description, featured) VALUES
('trlOTS4nKO4', 'LUCID DREAM', '2026-05-26', 'japanese-music-video', 'LUCID DREAM', '', 0),
('1Lmy7qwmSMc', 'BLACKHOLE', '2026-02-23', 'music-video', 'REVIVE+', 'The title transmission for REVIVE+, presented through a cinematic science-fiction world of disappearance and rebirth.', 1),
('9qkpcLK422o', 'BANG BANG', '2026-02-09', 'music-video', 'REVIVE+', '', 0),
('B1ShLiq3EVc', 'XOXZ', '2025-08-25', 'music-video', 'IVE SECRET', '', 0),
('gC7cURZsiH8', 'Be Alright', '2025-07-26', 'japanese-music-video', 'Be Alright', '', 0),
('38xYeot-ciM', 'ATTITUDE', '2025-02-03', 'music-video', 'IVE EMPATHY', '', 0),
('g36q0ZLvygQ', 'REBEL HEART', '2025-01-13', 'music-video', 'IVE EMPATHY', '', 0),
('fyk6vjwI3wc', 'Supernova Love', '2024-11-08', 'music-video', 'Supernova Love', '', 0),
('D-geLVTaBAo', 'CRUSH', '2024-08-07', 'japanese-music-video', 'ALIVE', '', 0),
('9adnWMIVHQ0', 'SUMMER FESTA', '2024-06-28', 'music-video', 'SUMMER FESTA', '', 0),
('PGLx4V680J8', 'Accendio', '2024-05-15', 'music-video', 'IVE SWITCH', '', 0),
('07EzMbVH3QE', 'HEYA', '2024-04-29', 'music-video', 'IVE SWITCH', '', 0),
('xU8mQMLx0tk', 'All Night (Feat. Saweetie)', '2024-01-19', 'music-video', 'All Night', '', 0),
('Da4P2uT4mVc', 'Baddie', '2023-10-13', 'music-video', 'I''VE MINE', '', 0),
('_ApV7Lm87cg', 'Off The Record', '2023-10-06', 'music-video', 'I''VE MINE', '', 0),
('_Hu4GYtye5U', 'Either Way', '2023-09-25', 'music-video', 'I''VE MINE', '', 0),
('okVTSehE414', 'I WANT', '2023-07-13', 'music-video', 'I WANT', '', 0),
('qD1kP_nJU3o', 'WAVE', '2023-05-09', 'japanese-music-video', 'WAVE', '', 0),
('6ZUIwj3FgUY', 'I AM', '2023-04-10', 'music-video', 'I''VE IVE', '', 0),
('pG6iaOMV46I', 'Kitsch', '2023-03-27', 'music-video', 'I''VE IVE', '', 0),
('XfEZzUtdINI', 'ELEVEN -Japanese ver.-', '2022-09-19', 'japanese-music-video', 'ELEVEN -Japanese ver.-', '', 0),
('F0B7HDiY-10', 'After LIKE', '2022-08-22', 'music-video', 'After LIKE', '', 0),
('Y8JFxS1HlDo', 'LOVE DIVE', '2022-04-05', 'music-video', 'LOVE DIVE', '', 0),
('--FmExEAsM8', 'ELEVEN', '2021-12-01', 'music-video', 'ELEVEN', '', 0),
('vS4xzjHCI1o', 'IVE, David Guetta - Supernova Love MV BTS', '2024-11-29', 'behind', 'Supernova Love', '', 0),
('es9MaJPb_U8', 'REBEL HEART · Performance Video', '2025-01-20', 'performance', 'IVE EMPATHY', '', 0),
('TNDF5Qr6ayo', 'BLACKHOLE · Dance Practice', '2026-02-28', 'practice', 'REVIVE+', '', 0),
('TT1rdIBPfmY', 'REBEL HEART · Dance Practice', '2025-01-21', 'practice', 'IVE EMPATHY', '', 0);
