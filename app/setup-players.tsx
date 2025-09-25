
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '../components/Icon';

export default function SetupPlayersScreen() {
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      if (players.includes(newPlayerName.trim())) {
        Alert.alert('Duplicate Name', 'This player name already exists. Please choose a different name.');
        return;
      }
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      const updatedPlayers = players.filter((_, i) => i !== index);
      setPlayers(updatedPlayers);
    } else {
      Alert.alert('Minimum Players', 'You need at least 2 players to start a game.');
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = name;
    setPlayers(updatedPlayers);
  };

  const startGame = () => {
    const validPlayers = players.filter(name => name.trim() !== '');
    
    if (validPlayers.length < 2) {
      Alert.alert('Not Enough Players', 'Please add at least 2 players to start the game.');
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(validPlayers.map(name => name.trim()));
    if (uniqueNames.size !== validPlayers.length) {
      Alert.alert('Duplicate Names', 'Please make sure all player names are unique.');
      return;
    }

    // Navigate to game screen with player names
    const playerParams = validPlayers.map((name, index) => `player${index}=${encodeURIComponent(name)}`).join('&');
    router.push(`/game?${playerParams}`);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        {/* Header */}
        <View style={[commonStyles.row, { marginBottom: 32 }]}>
          <TouchableOpacity onPress={goBack} style={{ padding: 8, marginLeft: -8 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginRight: 40 }]}>
            Setup Players
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Current Players */}
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Players ({players.filter(p => p.trim()).length})</Text>
            
            {players.map((player, index) => (
              <View key={index} style={[commonStyles.row, { marginBottom: 12 }]}>
                <TextInput
                  style={[commonStyles.input, { flex: 1, marginBottom: 0, marginRight: 12 }]}
                  placeholder={`Player ${index + 1} name`}
                  value={player}
                  onChangeText={(text) => updatePlayerName(index, text)}
                  maxLength={20}
                />
                {players.length > 2 && (
                  <TouchableOpacity
                    onPress={() => removePlayer(index)}
                    style={{
                      backgroundColor: colors.danger,
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="trash-outline" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Add New Player */}
          {players.length < 8 && (
            <View style={commonStyles.section}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Add Player</Text>
              <View style={commonStyles.row}>
                <TextInput
                  style={[commonStyles.input, { flex: 1, marginBottom: 0, marginRight: 12 }]}
                  placeholder="Enter player name"
                  value={newPlayerName}
                  onChangeText={setNewPlayerName}
                  maxLength={20}
                  onSubmitEditing={addPlayer}
                />
                <TouchableOpacity
                  onPress={addPlayer}
                  style={[buttonStyles.primary, { paddingHorizontal: 16 }]}
                >
                  <Icon name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={[commonStyles.card, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
              Game Setup Tips:
            </Text>
            <Text style={commonStyles.textSecondary}>
              • You need at least 2 players to start a game{'\n'}
              • You can add up to 8 players{'\n'}
              • All player names must be unique{'\n'}
              • Player names can be up to 20 characters long
            </Text>
          </View>
        </ScrollView>

        {/* Start Game Button */}
        <View style={{ paddingTop: 20 }}>
          <TouchableOpacity
            style={[
              buttonStyles.primary,
              {
                opacity: players.filter(p => p.trim()).length >= 2 ? 1 : 0.5,
              }
            ]}
            onPress={startGame}
            disabled={players.filter(p => p.trim()).length < 2}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Start Game ({players.filter(p => p.trim()).length} players)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
