
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GameStatistics } from '../types/GameTypes';
import { calculateStatistics } from '../utils/storage';
import Icon from '../components/Icon';

export default function StatisticsScreen() {
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await calculateStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const getTopPlayers = () => {
    if (!statistics) return [];
    
    return Object.entries(statistics.playerStats)
      .sort(([, a], [, b]) => b.winRate - a.winRate)
      .slice(0, 5);
  };

  const getBestAverageScorers = () => {
    if (!statistics) return [];
    
    return Object.entries(statistics.playerStats)
      .sort(([, a], [, b]) => b.averageScore - a.averageScore)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Loading statistics...</Text>
      </SafeAreaView>
    );
  }

  if (!statistics || statistics.totalGames === 0) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.content}>
          {/* Header */}
          <View style={[commonStyles.row, { marginBottom: 32 }]}>
            <TouchableOpacity onPress={goBack} style={{ padding: 8, marginLeft: -8 }}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginRight: 40 }]}>
              Statistics
            </Text>
          </View>

          <View style={[commonStyles.centerContent, { flex: 1 }]}>
            <Icon name="bar-chart-outline" size={64} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No statistics available yet.{'\n'}Play some games to see your stats!
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
        </View>
      </SafeAreaView>
    );
  }

  const topPlayers = getTopPlayers();
  const bestScorers = getBestAverageScorers();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={[commonStyles.row, { marginBottom: 32 }]}>
          <TouchableOpacity onPress={goBack} style={{ padding: 8, marginLeft: -8 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginRight: 40 }]}>
            Statistics
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Overall Stats */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Overall Statistics</Text>
            <View style={commonStyles.card}>
              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <View style={commonStyles.centerContent}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>
                    {statistics.totalGames}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Games Played</Text>
                </View>
                <View style={commonStyles.centerContent}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: colors.accent }}>
                    {Object.keys(statistics.playerStats).length}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Total Players</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Top Players by Win Rate */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Top Players (Win Rate)</Text>
            <View style={commonStyles.card}>
              {topPlayers.map(([playerName, stats], index) => (
                <View key={playerName} style={[commonStyles.row, { marginBottom: index === topPlayers.length - 1 ? 0 : 12 }]}>
                  <View style={commonStyles.row}>
                    <View style={{
                      backgroundColor: index === 0 ? colors.accent : index === 1 ? colors.warning : index === 2 ? '#CD7F32' : colors.textSecondary,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                        {index + 1}
                      </Text>
                    </View>
                    <View>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>{playerName}</Text>
                      <Text style={commonStyles.textSecondary}>
                        {stats.gamesWon}/{stats.gamesPlayed} games won
                      </Text>
                    </View>
                  </View>
                  <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.primary }]}>
                    {stats.winRate.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Best Average Scorers */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Highest Average Scores</Text>
            <View style={commonStyles.card}>
              {bestScorers.map(([playerName, stats], index) => (
                <View key={playerName} style={[commonStyles.row, { marginBottom: index === bestScorers.length - 1 ? 0 : 12 }]}>
                  <View style={commonStyles.row}>
                    <View style={{
                      backgroundColor: index === 0 ? colors.accent : index === 1 ? colors.warning : index === 2 ? '#CD7F32' : colors.textSecondary,
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                        {index + 1}
                      </Text>
                    </View>
                    <View>
                      <Text style={[commonStyles.text, { fontWeight: '600' }]}>{playerName}</Text>
                      <Text style={commonStyles.textSecondary}>
                        {stats.gamesPlayed} games played
                      </Text>
                    </View>
                  </View>
                  <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '700', color: colors.primary }]}>
                    {stats.averageScore.toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Detailed Player Stats */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>All Player Statistics</Text>
            {Object.entries(statistics.playerStats).map(([playerName, stats]) => (
              <View key={playerName} style={[commonStyles.card, { marginBottom: 12 }]}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                  {playerName}
                </Text>
                <View style={[commonStyles.row, { marginBottom: 4 }]}>
                  <Text style={commonStyles.textSecondary}>Games Played:</Text>
                  <Text style={commonStyles.text}>{stats.gamesPlayed}</Text>
                </View>
                <View style={[commonStyles.row, { marginBottom: 4 }]}>
                  <Text style={commonStyles.textSecondary}>Games Won:</Text>
                  <Text style={commonStyles.text}>{stats.gamesWon}</Text>
                </View>
                <View style={[commonStyles.row, { marginBottom: 4 }]}>
                  <Text style={commonStyles.textSecondary}>Win Rate:</Text>
                  <Text style={[commonStyles.text, { color: colors.accent, fontWeight: '600' }]}>
                    {stats.winRate.toFixed(1)}%
                  </Text>
                </View>
                <View style={[commonStyles.row, { marginBottom: 4 }]}>
                  <Text style={commonStyles.textSecondary}>Total Score:</Text>
                  <Text style={commonStyles.text}>{stats.totalScore}</Text>
                </View>
                <View style={commonStyles.row}>
                  <Text style={commonStyles.textSecondary}>Average Score:</Text>
                  <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                    {stats.averageScore.toFixed(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
