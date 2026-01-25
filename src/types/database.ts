// SSS Ryder - Database Types
// ===========================

export type UserRole = 'admin' | 'player';
export type MatchStatus = 'pending' | 'in_progress' | 'completed';
export type MatchResult = 'team_a_win' | 'team_b_win' | 'draw' | 'in_progress';
export type RoundFormat = 'foursomes' | 'fourball' | 'singles' | 'scramble';
export type ChallengeType = 'individual' | 'pair' | 'team';
export type ChallengeStatus = 'assigned' | 'completed' | 'failed' | 'pending';
export type DrinkType = 'cerveza' | 'chupito' | 'copa' | 'hidalgo';
export type EventType = 'score_update' | 'drink' | 'challenge_completed' | 'challenge_failed' | 'trophy_awarded' | 'match_started' | 'match_completed';

export interface Profile {
  id: string;
  display_name: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  team_id: string | null;
  secret_word: string | null;
  handicap: number | null;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  color: string;
  logo_url: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Round {
  id: string;
  tournament_id: string;
  name: string;
  round_order: number;
  format: RoundFormat;
  date_time: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  round_id: string;
  team_a_players: string[];
  team_b_players: string[];
  team_a_id: string | null;
  team_b_id: string | null;
  status: MatchStatus;
  result: MatchResult;
  score_display: string;
  holes_played: number;
  points_value: number;
  team_a_points: number;
  team_b_points: number;
  team_a_strokes: number;  // For stroke play (singles)
  team_b_strokes: number;  // For stroke play (singles)
  created_at: string;
  updated_at: string;
}

export interface MatchUpdate {
  id: string;
  match_id: string;
  updated_by: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface HoleScore {
  id: string;
  match_id: string;
  hole_number: number;
  player_id: string;
  strokes: number;
  created_at: string;
  updated_at: string;
}

export interface Drink {
  id: string;
  tournament_id: string;
  user_id: string;
  drink_type: DrinkType;
  count: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  tournament_id: string;
  title: string;
  description: string | null;
  challenge_type: ChallengeType;
  points_fun: number;
  penalty_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChallengeAssignment {
  id: string;
  challenge_id: string;
  assigned_to_user_id: string | null;
  assigned_to_team_id: string | null;
  status: ChallengeStatus;
  validated_by_user_id: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Trophy {
  id: string;
  tournament_id: string;
  title: string;
  description: string | null;
  emoji: string;
  winner_user_id: string | null;
  winner_team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFeed {
  id: string;
  tournament_id: string;
  event_type: EventType;
  actor_user_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

// Extended types with relations
export interface MatchWithDetails extends Match {
  round?: Round;
  team_a?: Team;
  team_b?: Team;
  team_a_player_profiles?: Profile[];
  team_b_player_profiles?: Profile[];
}

export interface ChallengeAssignmentWithDetails extends ChallengeAssignment {
  challenge?: Challenge;
  assigned_to_user?: Profile;
  assigned_to_team?: Team;
  validated_by_user?: Profile;
}

export interface DrinkWithProfile extends Drink {
  profile?: Profile;
}

export interface EventFeedWithActor extends EventFeed {
  actor?: Profile;
}

export interface TrophyWithWinner extends Trophy {
  winner_user?: Profile;
  winner_team?: Team;
}

// Leaderboard types
export interface DrinkLeaderboardEntry {
  user_id: string;
  profile: Profile;
  total_drinks: number;
  drink_breakdown: Record<DrinkType, number>;
}

export interface ChallengeLeaderboardEntry {
  user_id: string;
  profile: Profile;
  completed_challenges: number;
  total_points: number;
}

// Database response types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      tournaments: {
        Row: Tournament;
        Insert: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tournament, 'id' | 'created_at' | 'updated_at'>>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'total_points'>;
        Update: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>;
      };
      rounds: {
        Row: Round;
        Insert: Omit<Round, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Round, 'id' | 'created_at' | 'updated_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>;
      };
      match_updates: {
        Row: MatchUpdate;
        Insert: Omit<MatchUpdate, 'id' | 'created_at'>;
        Update: never;
      };
      drinks: {
        Row: Drink;
        Insert: Omit<Drink, 'id' | 'created_at'>;
        Update: Partial<Omit<Drink, 'id' | 'created_at'>>;
      };
      challenges: {
        Row: Challenge;
        Insert: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Challenge, 'id' | 'created_at' | 'updated_at'>>;
      };
      challenge_assignments: {
        Row: ChallengeAssignment;
        Insert: Omit<ChallengeAssignment, 'id' | 'created_at'>;
        Update: Partial<Omit<ChallengeAssignment, 'id' | 'created_at'>>;
      };
      trophies: {
        Row: Trophy;
        Insert: Omit<Trophy, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Trophy, 'id' | 'created_at' | 'updated_at'>>;
      };
      events_feed: {
        Row: EventFeed;
        Insert: Omit<EventFeed, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Enums: {
      user_role: UserRole;
      match_status: MatchStatus;
      match_result: MatchResult;
      round_format: RoundFormat;
      challenge_type: ChallengeType;
      challenge_status: ChallengeStatus;
      drink_type: DrinkType;
      event_type: EventType;
    };
  };
}

