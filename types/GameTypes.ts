
export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Game {
  id: string;
  players: Player[];
  date: Date;
  isCompleted: boolean;
  winner?: string;
  totalRounds: number;
}

export interface GameStatistics {
  totalGames: number;
  playerStats: {
    [playerName: string]: {
      gamesPlayed: number;
      gamesWon: number;
      totalScore: number;
      averageScore: number;
      winRate: number;
    };
  };
}
