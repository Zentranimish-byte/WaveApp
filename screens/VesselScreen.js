import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff', '#ff9f43', '#00d2d3', '#a29bfe', '#fd79a8', '#55efc4'];

export default function VesselScreen({ userId, onClose }) {
  const [entries, setEntries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const { data } = await supabase
      .from('vessel_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }

  async function addEntry() {
    if (!newLabel.trim() || !newPercentage) {
      Alert.alert('Fill in both fields');
      return;
    }
    const pct = parseInt(newPercentage);
    if (pct < 1 || pct > 100) {
      Alert.alert('Percentage must be between 1 and 100');
      return;
    }
    const color = COLORS[entries.length % COLORS.length];
    await supabase.from('vessel_entries').insert({
      user_id: userId,
      label: newLabel.trim(),
      percentage: pct,
      color,
    });
    setNewLabel('');
    setNewPercentage('');
    setShowAddModal(false);
    fetchEntries();
  }

  async function deleteEntry(id) {
    await supabase.from('vessel_entries').delete().eq('id', id);
    fetchEntries();
  }

  const totalPercentage = entries.reduce((sum, e) => sum + e.percentage, 0);
  const isComplete = entries.length >= 7;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>My Vessel</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>What are you made of?</Text>
        <Text style={styles.hint}>Add at least 7 things. Anything goes.</Text>

        <View style={styles.vessel}>
          <View style={styles.vesselOutline}>
            {entries.length === 0 && (
              <Text style={styles.vesselEmpty}>Empty for now...</Text>
            )}
            {entries.map((entry, index) => (
              <View
                key={entry.id}
                style={[styles.vesselLayer, {
                  backgroundColor: entry.color,
                  height: Math.max(30, (entry.percentage / Math.max(totalPercentage, 100)) * 200),
                  opacity: 0.85,
                }]}>
                <Text style={styles.vesselLayerText}>{entry.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.vesselCount}>{entries.length}/7 minimum</Text>
        </View>

        {isComplete && (
          <View style={styles.completeCard}>
            <Text style={styles.completeTitle}>Your vessel is alive.</Text>
            <Text style={styles.completeText}>
              {entries.map(e => `${e.percentage}% ${e.label}`).join(' · ')}
            </Text>
          </View>
        )}

        <View style={styles.entriesList}>
          {entries.map((entry, index) => (
            <View key={entry.id} style={[styles.entryRow, { borderLeftColor: entry.color }]}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryLabel}>{entry.label}</Text>
                <Text style={styles.entryPct}>{entry.percentage}%</Text>
              </View>
              <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                <Text style={styles.deleteBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add something</Text>
        </TouchableOpacity>

        {entries.length > 0 && entries.length < 7 && (
          <Text style={styles.progressHint}>{7 - entries.length} more to unlock your vessel</Text>
        )}
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>What are you made of?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. doom scrolling at 2AM"
              placeholderTextColor="#555"
              value={newLabel}
              onChangeText={setNewLabel}
              maxLength={40}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="How much? (1-100%)"
              placeholderTextColor="#555"
              value={newPercentage}
              onChangeText={setNewPercentage}
              keyboardType="number-pad"
              maxLength={3}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={addEntry}>
              <Text style={styles.submitBtnText}>Add to vessel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  backBtn: { color: '#00e87a', fontSize: 16 },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  subtitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  hint: { color: '#888', fontSize: 14, marginBottom: 32 },
  vessel: { alignItems: 'center', marginBottom: 32 },
  vesselOutline: { width: 160, minHeight: 240, borderWidth: 2, borderColor: '#333', borderRadius: 80, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#12121f' },
  vesselEmpty: { color: '#333', textAlign: 'center', padding: 20, fontSize: 13 },
  vesselLayer: { width: '100%', justifyContent: 'center', alignItems: 'center', paddingVertical: 4 },
  vesselLayerText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  vesselCount: { color: '#888', fontSize: 12, marginTop: 12 },
  completeCard: { backgroundColor: '#12121f', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f5f0c0' },
  completeTitle: { color: '#f5f0c0', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  completeText: { color: '#aaa', fontSize: 13, lineHeight: 20 },
  entriesList: { gap: 12, marginBottom: 24 },
  entryRow: { backgroundColor: '#12121f', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4 },
  entryInfo: { flex: 1 },
  entryLabel: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  entryPct: { color: '#888', fontSize: 13, marginTop: 2 },
  deleteBtn: { color: '#555', fontSize: 13 },
  addBtn: { backgroundColor: '#12121f', borderWidth: 1, borderColor: '#00e87a', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#00e87a', fontWeight: 'bold', fontSize: 16 },
  progressHint: { color: '#555', textAlign: 'center', fontSize: 13, marginBottom: 40 },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0a0a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1a1a2e' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#12121f', color: '#fff', padding: 16, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  submitBtn: { backgroundColor: '#00e87a', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  submitBtnText: { color: '#080810', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 14 },
});