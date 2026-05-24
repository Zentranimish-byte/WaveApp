import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import PaywallScreen from './PaywallScreen';
import PersonalityVessel from '../components/PersonalityVessel';
import Slider from '@react-native-community/slider';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [vesselEntries, setVesselEntries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPercentage, setNewPercentage] = useState(25);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    setProfile(data);
    fetchVesselEntries(user.id);
  }

  async function fetchVesselEntries(uid) {
    const { data } = await supabase.from('vessel_entries').select('*').eq('user_id', uid).order('created_at', { ascending: true });
    setVesselEntries(data || []);
  }

  async function addVesselEntry() {
    if (!newLabel.trim()) {
      Alert.alert('Add a label first');
      return;
    }
    const currentTotal = vesselEntries.reduce((sum, e) => sum + e.percentage, 0);
    const remaining = 100 - currentTotal;
    if (remaining <= 0) {
      Alert.alert('Vessel is full', 'Remove something before adding more.');
      return;
    }
    if (newPercentage > remaining) {
      Alert.alert('Too much', `You only have ${remaining}% remaining. Adjust the percentage.`);
      return;
    }
    const COLORS = ['#FF6B9D', '#C77DFF', '#48CAE4', '#F4A261', '#06D6A0', '#FFD166', '#EF476F', '#118AB2', '#9B5DE5', '#00F5D4'];
    const color = COLORS[vesselEntries.length % COLORS.length];
    const { data: { user } } = await supabase.auth.getUser();
    const tempEntry = {
      id: Date.now().toString(),
      user_id: user.id,
      label: newLabel.trim(),
      percentage: newPercentage,
      color,
      created_at: new Date().toISOString(),
    };
    setVesselEntries(prev => [...prev, tempEntry]);
    setNewLabel('');
    setNewPercentage(25);
    setShowAddModal(false);
    await supabase.from('vessel_entries').insert({
      user_id: user.id,
      label: tempEntry.label,
      percentage: tempEntry.percentage,
      color,
    });
    fetchVesselEntries(user.id);
  }
  
  async function deleteVesselEntry(id) {
    setVesselEntries(prev => prev.filter(e => e.id !== id));
    await supabase.from('vessel_entries').delete().eq('id', id);
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

        <PersonalityVessel
          entries={vesselEntries}
          gender={profile.gender}
          onAdd={() => setShowAddModal(true)}
          onDelete={deleteVesselEntry}
        />

        <Text style={styles.sectionTitle}>The Vibe</Text>
        <Text style={styles.currentlyInto}>Currently Into: {profile.currently_into}</Text>
        <View style={styles.tilesRow}>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>Here for</Text>
            <Text style={styles.tileText}>{profile.here_for}</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>What are you made of?</Text>
          <Text style={styles.remainingText}>{100 - vesselEntries.reduce((sum, e) => sum + e.percentage, 0)}% remaining</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 31% Nolan-brained"
              placeholderTextColor="#555"
              value={newLabel}
              onChangeText={setNewLabel}
              maxLength={40}
              autoFocus
            />
            <Text style={styles.sliderLabel}>How much? {newPercentage}%</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={newPercentage}
              onValueChange={value => setNewPercentage(value)}
              minimumTrackTintColor="#a29bfe"
              maximumTrackTintColor="#333"
              thumbTintColor="#a29bfe"
            />
            <View style={styles.sliderBtns}>
              {[10, 25, 50, 75].map(val => (
                <TouchableOpacity
                  key={val}
                  style={[styles.sliderPreset, newPercentage === val && styles.sliderPresetActive]}
                  onPress={() => setNewPercentage(val)}>
                  <Text style={[styles.sliderPresetText, newPercentage === val && styles.sliderPresetTextActive]}>{val}%</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sliderAdjust}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => setNewPercentage(Math.max(1, newPercentage - 1))}>
                <Text style={styles.adjustBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.adjustValue}>{newPercentage}%</Text>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => setNewPercentage(Math.min(100, newPercentage + 1))}>
                <Text style={styles.adjustBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={addVesselEntry}>
              <Text style={styles.submitBtnText}>Add to vessel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0a0a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1a1a2e' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#12121f', color: '#fff', padding: 16, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  sliderLabel: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  sliderBtns: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  sliderPreset: { flex: 1, borderWidth: 1, borderColor: '#333', padding: 8, borderRadius: 8, alignItems: 'center' },
  sliderPresetActive: { borderColor: '#a29bfe', backgroundColor: '#1a1a2e' },
  sliderPresetText: { color: '#888', fontSize: 13 },
  sliderPresetTextActive: { color: '#a29bfe', fontWeight: 'bold' },
  sliderAdjust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 20 },
  adjustBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#12121f', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  adjustBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  adjustValue: { color: '#fff', fontSize: 18, fontWeight: 'bold', width: 60, textAlign: 'center' },
  submitBtn: { backgroundColor: '#a29bfe', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 14 },
  remainingText: { color: '#a29bfe', fontSize: 13, marginBottom: 16, marginTop: -12 },
});