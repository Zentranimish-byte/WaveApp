import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import ChatScreen from './ChatScreen';
import SparkRoomsScreen from './SparkRoomsScreen';

export default function SparksScreen() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [interactions, setInteractions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [activeChatMatch, setActiveChatMatch] = useState(null);

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('USER:', user?.id, 'ERROR:', error?.message);
    if (!user) return;
    setUserId(user.id);
    fetchInteractions(user.id);
    fetchMatches(user.id);
  }

  async function fetchInteractions(uid) {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('receiver_id', uid)
      .order('created_at', { ascending: false });
    console.log('interactions:', data, error);
    setInteractions(data || []);
  }

  async function fetchMatches(uid) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
      .order('created_at', { ascending: false });
    console.log('matches:', data, error);
    setMatches(data || []);
  }

  if (activeChatMatch) return (
    <ChatScreen
      matchId={activeChatMatch.id}
      otherUserName="Match"
      onClose={() => setActiveChatMatch(null)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sparks</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rooms' && styles.tabActive]}
          onPress={() => setActiveTab('rooms')}>
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.tabTextActive]}>Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.tabActive]}
          onPress={() => setActiveTab('matches')}>
          <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'interactions' && styles.tabActive]}
          onPress={() => setActiveTab('interactions')}>
          <Text style={[styles.tabText, activeTab === 'interactions' && styles.tabTextActive]}>Interactions</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'rooms' && <SparkRoomsScreen />}

      {activeTab === 'matches' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Matches</Text>
          {matches.length === 0 && <Text style={styles.emptyText}>No matches yet...</Text>}
          {matches.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>:)</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>Match</Text>
                <Text style={styles.cardAction}>You matched!</Text>
              </View>
              <TouchableOpacity style={styles.chatBtn} onPress={() => setActiveChatMatch(item)}>
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {activeTab === 'interactions' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Interactions Received</Text>
          {interactions.length === 0 && <Text style={styles.emptyText}>No interactions yet...</Text>}
          {interactions.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>:)</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>Someone</Text>
                <Text style={styles.cardAction}>{item.interaction_type}d you</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 16 },
  tab: { paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#00ff88' },
  tabText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  content: { padding: 16 },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  emptyText: { color: '#444', fontSize: 14, marginBottom: 16 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#00ff88' },
  avatarSmallText: { color: '#00ff88', fontSize: 16 },
  cardInfo: { flex: 1 },
  cardName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardAction: { color: '#888', fontSize: 13, marginTop: 2 },
  chatBtn: { backgroundColor: '#00ff88', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chatBtnText: { color: '#0a0a1a', fontWeight: 'bold', fontSize: 12 },
});