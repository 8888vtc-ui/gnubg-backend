-- Création base de données complète GammonGuru
-- Exécuter dans Supabase SQL Editor ou psql

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table utilisateurs
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar TEXT,
  level VARCHAR(20) DEFAULT 'BEGINNER' CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'MASTER')),
  elo INTEGER DEFAULT 1500 CHECK (elo >= 0),
  subscription_type VARCHAR(20) DEFAULT 'FREE' CHECK (subscription_type IN ('FREE', 'PREMIUM', 'VIP')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false
);

-- Table parties
CREATE TABLE games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  white_player UUID REFERENCES users(id) ON DELETE SET NULL,
  black_player UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'PLAYING', 'FINISHED', 'ABORTED')),
  board_state TEXT NOT NULL DEFAULT '4HPwATDgc/ABMA',
  game_mode VARCHAR(20) DEFAULT 'AI_VS_PLAYER' CHECK (game_mode IN ('AI_VS_PLAYER', 'PLAYER_VS_PLAYER', 'TOURNAMENT')),
  current_player VARCHAR(10) DEFAULT 'white' CHECK (current_player IN ('white', 'black')),
  dice INTEGER[] DEFAULT '{}',
  white_score INTEGER DEFAULT 0,
  black_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  winner VARCHAR(10) CHECK (winner IN ('white', 'black', 'draw'))
);

-- Table mouvements de jeu
CREATE TABLE game_moves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player VARCHAR(10) NOT NULL CHECK (player IN ('white', 'black')),
  dice INTEGER[] NOT NULL,
  move TEXT NOT NULL,
  from_point INTEGER,
  to_point INTEGER,
  equity FLOAT,
  pr FLOAT,
  thinking_time INTEGER, -- en millisecondes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table analyses GNUBG
CREATE TABLE analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  board_state TEXT NOT NULL,
  dice INTEGER[] NOT NULL,
  move TEXT NOT NULL,
  best_move TEXT NOT NULL,
  equity FLOAT NOT NULL,
  pr FLOAT NOT NULL,
  explanation TEXT NOT NULL,
  alternatives JSONB DEFAULT '[]',
  analysis_type VARCHAR(20) DEFAULT 'FULL' CHECK (analysis_type IN ('FULL', 'HINT', 'EVALUATE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table abonnements Stripe
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('FREE', 'PREMIUM', 'VIP')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'UNPAID')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table tournois
CREATE TABLE tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  entry_fee INTEGER DEFAULT 0, -- en cents
  prize_pool INTEGER DEFAULT 0,
  max_players INTEGER,
  status VARCHAR(20) DEFAULT 'REGISTRATION' CHECK (status IN ('REGISTRATION', 'IN_PROGRESS', 'FINISHED', 'CANCELLED')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table participants tournoi
CREATE TABLE tournament_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_position INTEGER,
  eliminated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tournament_id, user_id)
);

-- Table connexions WebSocket
CREATE TABLE websocket_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Table analytics utilisateur
CREATE TABLE user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  analyses_completed INTEGER DEFAULT 0,
  time_played INTEGER DEFAULT 0, -- en minutes
  avg_equity FLOAT DEFAULT 0,
  elo_change INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Table messages chat
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'EMOJI', 'SYSTEM')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_players ON games(white_player, black_player);
CREATE INDEX idx_game_moves_game_id ON game_moves(game_id);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_websocket_connections_user_id ON websocket_connections(user_id);
CREATE INDEX idx_user_analytics_date ON user_analytics(date);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert données test
INSERT INTO users (email, password, username, level, elo) VALUES
('alice@example.com', '$2b$10$placeholder_hash', 'AliceGamer', 'INTERMEDIATE', 1650),
('bob@example.com', '$2b$10$placeholder_hash', 'BobPlayer', 'BEGINNER', 1450),
('charlie@example.com', '$2b$10$placeholder_hash', 'CharliePro', 'ADVANCED', 1750);

-- Fonction pour calculer quotas
CREATE OR REPLACE FUNCTION get_user_analysis_quota(user_uuid UUID)
RETURNS TABLE(
  quota_limit INTEGER,
  quota_used INTEGER,
  quota_remaining INTEGER
) AS $$
DECLARE
  user_sub VARCHAR(20);
  month_start DATE;
BEGIN
  -- Récupérer abonnement
  SELECT subscription_type INTO user_sub
  FROM users
  WHERE id = user_uuid;
  
  -- Début du mois
  month_start := DATE_TRUNC('month', CURRENT_DATE);
  
  -- Calculer quota selon abonnement
  CASE user_sub
    WHEN 'FREE' THEN quota_limit := 5;
    WHEN 'PREMIUM' THEN quota_limit := 100;
    WHEN 'VIP' THEN quota_limit := 1000;
    ELSE quota_limit := 5;
  END CASE;
  
  -- Compter analyses utilisées ce mois
  SELECT COUNT(*) INTO quota_used
  FROM analyses
  WHERE user_id = user_uuid 
  AND created_at >= month_start;
  
  quota_remaining := GREATEST(0, quota_limit - quota_used);
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Vue statistiques globales
CREATE VIEW global_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN subscription_type != 'FREE' THEN 1 END) as premium_users,
  AVG(elo) as avg_elo,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
FROM users;

COMMENT ON TABLE users IS 'Utilisateurs de GammonGuru';
COMMENT ON TABLE games IS 'Parties de backgammon';
COMMENT ON TABLE analyses IS 'Analyses GNUBG des positions';
COMMENT ON TABLE subscriptions IS 'Abonnements Stripe';
COMMENT ON TABLE tournaments IS 'Tournois payants';

-- Permissions (adapter selon votre setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO gammon_guru_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO gammon_guru_user;
