import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function SparksScreen() {
  const [interactions, setInteractions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    fetchInteractions(user.id);
    fetchMatches(user.id);
  }

  async function fetchInteractions(uid) {
    const { data } = await supabase
      .from('interactions')
      .select('*, profiles!interactions_sender_id_fkey(display_name, age, gender, tagline)')
      .eq('receiver_id', uid)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setInteractions(data || []);
  }

  async function fetchMatches(uid) {
    const { data } = await supabase
      .from('matches')
      .select('*, profiles!matches_user2_id_fkey(display_name, age, tagline)')
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
      .order('created_at', { ascending: false });
    setMatches(data || []);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sparks</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Interactions Received</Text>
        {interactions.length === 0 && <Text style={styles.emptyText}>No interactions yet...</Text>}
        {interactions.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>:)</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.profiles?.display_name || 'Someone'}</Text>
              <Text style={styles.cardAction}>{item.interaction_type}d you</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Matches</Text>
        {matches.length === 0 && <Text style={styles.emptyText}>No matches yet...</Text>}
        {matches.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>:)</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.profiles?.display_name || 'Someone'}</Text>
              <Text style={styles.cardAction}>Matched with you</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn}>
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  content: { padding: 16 },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 12, marginTop: 8, textTransform: 'uppercase' },
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