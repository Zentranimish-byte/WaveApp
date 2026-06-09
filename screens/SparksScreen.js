import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import ChatScreen from './ChatScreen';
import SparkRoomsScreen from './SparkRoomsScreen';

export default function SparksScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [interactions, setInteractions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [activeChatMatch, setActiveChatMatch] = useState(null);

  const TABS = ['Rooms', 'Matches'];

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
    onPanResponderRelease: (_, g) => {
      if (g.dx < -50) setActiveTab(prev => Math.min(prev + 1, 1));
      else if (g.dx > 50) setActiveTab(prev => Math.max(prev - 1, 0));
    },
  })).current;

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    fetchInteractions(user.id);
    fetchMatches(user.id);
  }

  async function fetchInteractions(uid) {
    const { data } = await supabase
      .from('interactions')
      .select('*')
      .eq('receiver_id', uid)
      .order('created_at', { ascending: false });
    setInteractions(data || []);
  }

  async function fetchMatches(uid) {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
      .order('created_at', { ascending: false });
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
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sparks</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === index && styles.tabActive]}
            onPress={() => setActiveTab(index)}>
            <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.indicator}>
        {TABS.map((_, index) => (
          <View key={index} style={[styles.dot, activeTab === index && styles.dotActive]} />
        ))}
      </View>

      {activeTab === 0 && <SparkRoomsScreen hideHeader={true} />}

      {activeTab === 1 && (
        <ScrollView style={styles.content}>
          {interactions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Interactions</Text>
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
            </>
          )}
          <Text style={styles.sectionTitle}>Matches</Text>
          {matches.length === 0 && interactions.length === 0 && (
            <Text style={styles.emptyText}>Nothing yet. Go wave at someone.</Text>
          )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 16, marginBottom: 4, gap: 32 },
  tab: { paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#00ff88' },
  tabText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  indicator: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#00ff88', width: 18 },
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