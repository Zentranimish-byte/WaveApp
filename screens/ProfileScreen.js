import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import PaywallScreen from './PaywallScreen';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    setProfile(data);
  }

  if (!profile) return (
    <View style={styles.container}>
      <Text style={styles.loading}>Loading...</Text>
    </View>
  );

  if (showPaywall) return (
    <PaywallScreen
      onClose={() => setShowPaywall(false)}
      onSubscribe={() => {
        alert('Premium coming soon!');
        setShowPaywall(false);
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.settingsIcon}>Settings</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>:)</Text>
          </View>
          <Text style={styles.name}>{profile.display_name}, {profile.age}</Text>
          <Text style={styles.gender}>{profile.gender}</Text>
          <Text style={styles.tagline}>{profile.tagline}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.premiumBtn} onPress={() => setShowPaywall(true)}>
          <Text style={styles.premiumBtnText}>Get Premium</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>The Vibe</Text>
        <Text style={styles.currentlyInto}>Currently Into: {profile.currently_into}</Text>
        <View style={styles.tilesRow}>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Here for</Text>
            <Text style={styles.tileText}>{profile.here_for}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  loading: { color: '#fff', textAlign: 'center', marginTop: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  settingsIcon: { color: '#888', fontSize: 14 },
  content: { padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#00ff88' },
  avatarEmoji: { fontSize: 40, color: '#00ff88' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  gender: { color: '#888', fontSize: 14, marginTop: 2 },
  tagline: { color: '#00ff88', fontSize: 16, marginTop: 8, fontStyle: 'italic' },
  editBtn: { borderWidth: 1, borderColor: '#00ff88', padding: 12, borderRadius: 20, alignItems: 'center', marginBottom: 12 },
  editBtnText: { color: '#00ff88', fontWeight: 'bold' },
  premiumBtn: { backgroundColor: '#f5f0c0', padding: 12, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
  premiumBtnText: { color: '#080810', fontWeight: 'bold' },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  currentlyInto: { color: '#fff', backgroundColor: '#1a1a2e', padding: 12, borderRadius: 12, marginBottom: 12 },
  tilesRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tile: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, alignItems: 'center' },
  tileLabel: { color: '#00ff88', fontSize: 12, marginBottom: 4, fontWeight: 'bold' },
  tileText: { color: '#fff', fontSize: 12, textAlign: 'center' },
});