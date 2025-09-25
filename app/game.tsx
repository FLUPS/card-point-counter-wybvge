
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Player, Game } from '../types/GameTypes';
import { saveGame, updateGame } from '../utils/storage';
import Icon from '../components/Icon';

export default function GameScreen() {
  const params = useLocalSearchParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [roundScores, setRoundScores] = useState<{ [playerId: string]: string }>({});

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Extract player names from params
    const playerNames: string[] = [];
    let index = 0;
    while (params[`player${index}`]) {
      playerNames.push(decodeURIComponent(params[`player${index}`] as string));
      index++;
    }

    console.log('Initializing game with players:', playerNames);

    // Create player objects
    const gamePlayers: Player[] = playerNames.map((name, idx) => ({
      id: `player_${idx}_${Date.now()}`,
      name,
      score: 0,
    }));

    setPlayers(gamePlayers);

    // Create new game
    const newGame: Game = {
      id: `game_${Date.now()}`,
      players: gamePlayers,
      date: new Date(),
      isCompleted: false,
      totalRounds: 0,
    };

    setCurrentGame(newGame);

    // Initialize round scores
    const initialScores: { [playerId: string]: string } = {};
    gamePlayers.forEach(player => {
      initialScores[player.id] = '';
    });
    setRoundScores(initialScores);
  };

  const updateRoundScore = (playerId: string, score: string) => {
    setRoundScores(prev => ({
      ...prev,
      [playerId]: score,
    }));
  };

  const addRoundScores = async () => {
    if (!currentGame) return;

    // Validate all scores are entered
    const hasEmptyScores = Object.values(roundScores).some(score => score.trim() === '');
    if (hasEmptyScores) {
      Alert.alert('Missing Scores', 'Please enter scores for all players before adding the round.');
      return;
    }

    // Update player scores
    const updatedPlayers = players.map(player => {
      const roundScore = parseInt(roundScores[player.id]) || 0;
      return {
        ...player,
        score: player.score + roundScore,
      };
    });

    setPlayers(updatedPlayers);

    // Update game
    const updatedGame: Game = {
      ...currentGame,
      players: updatedPlayers,
      totalRounds: currentGame.totalRounds + 1,
    };

    setCurrentGame(updatedGame);

    // Save game
    if (currentGame.totalRounds === 0) {
      await saveGame(updatedGame);
    } else {
      await updateGame(currentGame.id, updatedGame);
    }

    // Clear round scores
    const clearedScores: { [playerId: string]: string } = {};
    players.forEach(player => {
      clearedScores[player.id] = '';
    });
    setRoundScores(clearedScores);

    console.log('Round added successfully');
  };

  const finishGame = async () => {
    console.log('Finish game button pressed');
    
    if (!currentGame) {
      console.log('No current game found');
      return;
    }

    if (currentGame.totalRounds === 0) {
      Alert.alert('No Rounds Played', 'Please play at least one round before finishing the game.');
      return;
    }

    try {
      console.log('Processing game completion...');
      
      // Find winner (highest score)
      const winner = players.reduce((prev, current) => 
        prev.score > current.score ? prev : current
      );

      console.log('Winner determined:', winner.name, 'with score:', winner.score);

      const completedGame: Game = {
        ...currentGame,
        isCompleted: true,
        winner: winner.name,
      };

      console.log('Updating game in storage...');
      await updateGame(currentGame.id, completedGame);
      console.log('Game updated successfully');

      Alert.alert(
        'Game Completed!',
        `Congratulations ${winner.name}! You won with ${winner.score} points.`,
        [
          {
            text: 'View Results',
            onPress: () => {
              console.log('Navigating to home screen...');
              try {
                router.replace('/');
              } catch (error) {
                console.error('Navigation error:', error);
                // Fallback navigation
                router.push('/');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error finishing game:', error);
      Alert.alert(
        'Error',
        'There was an error finishing the game. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => console.log('Error alert dismissed'),
          },
        ]
      );
    }
  };

  const goBack = () => {
    if (currentGame && currentGame.totalRounds > 0) {
      Alert.alert(
        'Game in Progress',
        'You have an active game. Are you sure you want to go back? Your progress will be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go Back', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const resetScores = () => {
    Alert.alert(
      'Reset Game',
      'Are you sure you want to reset all scores? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const resetPlayers = players.map(player => ({ ...player, score: 0 }));
            setPlayers(resetPlayers);
            if (currentGame) {
              const resetGame = { ...currentGame, players: resetPlayers, totalRounds: 0 };
              setCurrentGame(resetGame);
            }
            const clearedScores: { [playerId: string]: string } = {};
            players.forEach(player => {
              clearedScores[player.id] = '';
            });
            setRoundScores(clearedScores);
          },
        },
      ]
    );
  };

  if (!currentGame) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Loading game...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={[commonStyles.row, { marginBottom: 24 }]}>
          <TouchableOpacity onPress={goBack} style={{ padding: 8, marginLeft: -8 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', marginRight: 40 }}>
            <Text style={[commonStyles.title, { fontSize: 24 }]}>Round {currentGame.totalRounds + 1}</Text>
            <Text style={commonStyles.textSecondary}>{players.length} players</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Current Scores */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Current Scores</Text>
            <View style={commonStyles.card}>
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <View key={player.id} style={[commonStyles.row, { marginBottom: index === players.length - 1 ? 0 : 12 }]}>
                    <View style={commonStyles.row}>
                      <View style={{
                        backgroundColor: index === 0 ? colors.accent : colors.textSecondary,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>{player.name}</Text>
                    </View>
                    <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.primary }]}>
                      {player.score}
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Round Scores Input */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Add Round Scores</Text>
            {players.map((player) => (
              <View key={player.id} style={[commonStyles.row, { marginBottom: 12 }]}>
                <Text style={[commonStyles.text, { flex: 1, fontWeight: '500' }]}>
                  {player.name}
                </Text>
                <TextInput
                  style={[commonStyles.input, { width: 80, textAlign: 'center', marginBottom: 0 }]}
                  placeholder="0"
                  value={roundScores[player.id]}
                  onChangeText={(text) => updateRoundScore(player.id, text)}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 16 }]}
              onPress={addRoundScores}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Add Round Scores
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={{ paddingTop: 20 }}>
          <View style={commonStyles.row}>
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1, marginRight: 8 }]}
              onPress={resetScores}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                Reset Game
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.primary, { flex: 1, marginLeft: 8 }]}
              onPress={finishGame}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Finish Game
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
