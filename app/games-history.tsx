
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Game } from '../types/GameTypes';
import { getGames, deleteGame } from '../utils/storage';
import Icon from '../components/Icon';

export default function GamesHistoryScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const allGames = await getGames();
      setGames(allGames.reverse()); // Show newest first
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = (gameId: string) => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGame(gameId);
            await loadGames();
          },
        },
      ]
    );
  };

  const goBack = () => {
    router.back();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTopPlayers = (game: Game) => {
    return game.players
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Loading games...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={[commonStyles.row, { marginBottom: 32 }]}>
          <TouchableOpacity onPress={goBack} style={{ padding: 8, marginLeft: -8 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginRight: 40 }]}>
            Game History
          </Text>
        </View>

        {games.length === 0 ? (
          <View style={[commonStyles.centerContent, { flex: 1 }]}>
            <Icon name="game-controller-outline" size={64} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No games played yet.{'\n'}Start your first game to see it here!
            </Text>
            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 24 }]}
              onPress={() => router.push('/setup-players')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Start New Game
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {games.map((game) => {
              const topPlayers = getTopPlayers(game);
              return (
                <View key={game.id} style={[commonStyles.card, { marginBottom: 16 }]}>
                  {/* Game Header */}
                  <View style={[commonStyles.row, { marginBottom: 12 }]}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {formatDate(game.date)}
                      </Text>
                      <Text style={commonStyles.textSecondary}>
                        {game.players.length} players • {game.totalRounds} rounds
                      </Text>
                    </View>
                    <View style={commonStyles.row}>
                      <View style={{
                        backgroundColor: game.isCompleted ? colors.accent : colors.warning,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        marginRight: 8,
                      }}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                          {game.isCompleted ? 'Completed' : 'In Progress'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteGame(game.id)}
                        style={{ padding: 4 }}
                      >
                        <Icon name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Winner */}
                  {game.winner && (
                    <View style={{
                      backgroundColor: colors.background,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}>
                      <Text style={{ color: colors.accent, fontWeight: '600', textAlign: 'center' }}>
                        🏆 Winner: {game.winner}
                      </Text>
                    </View>
                  )}

                  {/* Top Players */}
                  <View>
                    <Text style={[commonStyles.textSecondary, { marginBottom: 8, fontSize: 12 }]}>
                      FINAL SCORES
                    </Text>
                    {topPlayers.map((player, index) => (
                      <View key={player.id} style={[commonStyles.row, { marginBottom: 4 }]}>
                        <View style={commonStyles.row}>
                          <View style={{
                            backgroundColor: index === 0 ? colors.accent : colors.textSecondary,
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                          }}>
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                              {index + 1}
                            </Text>
                          </View>
                          <Text style={[commonStyles.textSecondary, { fontWeight: index === 0 ? '600' : '400' }]}>
                            {player.name}
                          </Text>
                        </View>
                        <Text style={[
                          commonStyles.textSecondary,
                          { fontWeight: index === 0 ? '700' : '500', color: index === 0 ? colors.accent : colors.textSecondary }
                        ]}>
                          {player.score}
                        </Text>
                      </View>
                    ))}
                    {game.players.length > 3 && (
                      <Text style={[commonStyles.textSecondary, { fontSize: 12, textAlign: 'center', marginTop: 4 }]}>
                        +{game.players.length - 3} more players
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
