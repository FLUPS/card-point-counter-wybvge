
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getGames, calculateStatistics } from '../utils/storage';
import { Game, GameStatistics } from '../types/GameTypes';
import Icon from '../components/Icon';

export default function HomeScreen() {
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const games = await getGames();
      setRecentGames(games.slice(-3).reverse()); // Get last 3 games
      const stats = await calculateStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const startNewGame = () => {
    router.push('/setup-players');
  };

  const viewAllGames = () => {
    router.push('/games-history');
  };

  const viewStatistics = () => {
    router.push('/statistics');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 32 }}>
          <Text style={commonStyles.title}>Card Game Scorer</Text>
          <Text style={commonStyles.textSecondary}>
            Track points and view statistics for your card games
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.section}>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 16 }]}
            onPress={startNewGame}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Start New Game
            </Text>
          </TouchableOpacity>

          <View style={commonStyles.row}>
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1, marginRight: 8 }]}
              onPress={viewAllGames}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                Game History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1, marginLeft: 8 }]}
              onPress={viewStatistics}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                Statistics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        {statistics && statistics.totalGames > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Quick Stats</Text>
            <View style={commonStyles.card}>
              <View style={commonStyles.row}>
                <View style={commonStyles.centerContent}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
                    {statistics.totalGames}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Games Played</Text>
                </View>
                <View style={commonStyles.centerContent}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.accent }}>
                    {Object.keys(statistics.playerStats).length}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Players</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <View style={commonStyles.section}>
            <View style={[commonStyles.row, { marginBottom: 16 }]}>
              <Text style={commonStyles.subtitle}>Recent Games</Text>
              <TouchableOpacity onPress={viewAllGames}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {recentGames.map((game) => (
              <View key={game.id} style={commonStyles.card}>
                <View style={[commonStyles.row, { marginBottom: 8 }]}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {formatDate(game.date)}
                  </Text>
                  <View style={{
                    backgroundColor: game.isCompleted ? colors.accent : colors.warning,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                      {game.isCompleted ? 'Completed' : 'In Progress'}
                    </Text>
                  </View>
                </View>
                
                <View style={commonStyles.row}>
                  <Text style={commonStyles.textSecondary}>
                    {game.players.length} players
                  </Text>
                  {game.winner && (
                    <Text style={{ color: colors.accent, fontWeight: '500' }}>
                      Winner: {game.winner}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {recentGames.length === 0 && (
          <View style={[commonStyles.centerContent, { marginTop: 60 }]}>
            <Icon name="game-controller-outline" size={64} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No games yet. Start your first game to begin tracking scores!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
