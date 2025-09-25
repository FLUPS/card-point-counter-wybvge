
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, GameStatistics } from '../types/GameTypes';

const GAMES_KEY = 'card_game_games';
const STATS_KEY = 'card_game_statistics';

export const saveGame = async (game: Game): Promise<void> => {
  try {
    const existingGames = await getGames();
    const updatedGames = [...existingGames, game];
    await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(updatedGames));
    console.log('Game saved successfully');
  } catch (error) {
    console.error('Error saving game:', error);
  }
};

export const getGames = async (): Promise<Game[]> => {
  try {
    const gamesJson = await AsyncStorage.getItem(GAMES_KEY);
    if (gamesJson) {
      const games = JSON.parse(gamesJson);
      // Convert date strings back to Date objects
      return games.map((game: any) => ({
        ...game,
        date: new Date(game.date),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting games:', error);
    return [];
  }
};

export const updateGame = async (gameId: string, updatedGame: Game): Promise<void> => {
  try {
    const games = await getGames();
    const gameIndex = games.findIndex(game => game.id === gameId);
    if (gameIndex !== -1) {
      games[gameIndex] = updatedGame;
      await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(games));
      console.log('Game updated successfully');
    }
  } catch (error) {
    console.error('Error updating game:', error);
  }
};

export const deleteGame = async (gameId: string): Promise<void> => {
  try {
    const games = await getGames();
    const filteredGames = games.filter(game => game.id !== gameId);
    await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(filteredGames));
    console.log('Game deleted successfully');
  } catch (error) {
    console.error('Error deleting game:', error);
  }
};

export const calculateStatistics = async (): Promise<GameStatistics> => {
  try {
    const games = await getGames();
    const completedGames = games.filter(game => game.isCompleted);
    
    const playerStats: { [playerName: string]: any } = {};
    
    completedGames.forEach(game => {
      game.players.forEach(player => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            scores: [],
          };
        }
        
        playerStats[player.name].gamesPlayed += 1;
        playerStats[player.name].totalScore += player.score;
        playerStats[player.name].scores.push(player.score);
        
        if (game.winner === player.name) {
          playerStats[player.name].gamesWon += 1;
        }
      });
    });
    
    // Calculate averages and win rates
    Object.keys(playerStats).forEach(playerName => {
      const stats = playerStats[playerName];
      stats.averageScore = stats.totalScore / stats.gamesPlayed;
      stats.winRate = (stats.gamesWon / stats.gamesPlayed) * 100;
      delete stats.scores; // Remove scores array from final stats
    });
    
    return {
      totalGames: completedGames.length,
      playerStats,
    };
  } catch (error) {
    console.error('Error calculating statistics:', error);
    return {
      totalGames: 0,
      playerStats: {},
    };
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(GAMES_KEY);
    await AsyncStorage.removeItem(STATS_KEY);
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
