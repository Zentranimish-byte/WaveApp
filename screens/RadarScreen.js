import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';

export default function RadarScreen() {
  const [location, setLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is needed for the radar.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    await updateLocation(user.id, loc.coords.latitude, loc.coords.longitude);
    await fetchNearbyUsers(user.id, loc.coords.latitude, loc.coords.longitude);
  }

  async function updateLocation(uid, lat, lng) {
    await supabase.from('user_locations').upsert({
      user_id: uid,
      latitude: lat,
      longitude: lng,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  async function fetchNearbyUsers(uid, lat, lng) {
    const { data } = await supabase.from('user_locations').select('user_id, latitude, longitude').neq('user_id', uid);
    if (!data) return;
    const nearby = data.filter(u => {
      const dist = getDistance(lat, lng, u.latitude, u.longitude);
      u.distance = dist;
      return dist <= 500;
    });
    const userIds = nearby.map(u => u.user_id);
    if (userIds.length === 0) { setNearbyUsers([]); return; }
    const { data: profiles } = await supabase.from('profiles').select('user_id, display_name, age, gender, tagline').in('user_id', userIds);
    const combined = nearby.map(u => ({
      ...u,
      profile: profiles?.find(p => p.user_id === u.user_id)
    }));
    setNearbyUsers(combined);
  }

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function getDotPosition(index, total) {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 80 + Math.random() * 50;
    return {
      left: 130 + radius * Math.cos(angle),
      top: 130 + radius * Math.sin(angle),
    };
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Wave</Text>
        <TouchableOpacity style={[styles.ghostButton, !isVisible && styles.ghostActive]} onPress={() => setIsVisible(!isVisible)}>
          <Text style={styles.ghostIcon}>Ghost</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.radarContainer}>
        <View style={styles.radarOuter}>
          <View style={styles.radarMiddle}>
            <View style={styles.radarInner}>
              <Text style={styles.youDot}>You</Text>
            </View>
          </View>
        </View>

        {nearbyUsers.map((user, index) => {
  const pos = getDotPosition(index, nearbyUsers.length);
  return (
    <TouchableOpacity key={user.user_id} style={[styles.userDot, { left: pos.left, top: pos.top }]} onPress={() => setSelectedUser(user)}>
      <Text style={styles.userDotText}>{user.profile?.display_name?.charAt(0) || '?'}</Text>
    </TouchableOpacity>
  );
})}
      </View>

      <Text style={styles.nearbyText}>
        {!location ? 'Getting your location...' : nearbyUsers.length === 0 ? 'No one nearby yet...' : `${nearbyUsers.length} people nearby`}
      </Text>

      <TouchableOpacity style={styles.refreshBtn} onPress={() => location && fetchNearbyUsers(userId, location.latitude, location.longitude)}>
        <Text style={styles.refreshText}>Refresh Radar</Text>
      </TouchableOpacity>
      <Modal visible={!!selectedUser} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <View style={styles.modalAvatar}>
        <Text style={styles.modalAvatarText}>:)</Text>
      </View>
      <Text style={styles.modalName}>
        {selectedUser?.profile?.display_name}, {selectedUser?.profile?.age}
      </Text>
      <Text style={styles.modalGender}>{selectedUser?.profile?.gender}</Text>
      <Text style={styles.modalTagline}>{selectedUser?.profile?.tagline}</Text>
      <Text style={styles.modalDistance}>{Math.round(selectedUser?.distance)}m away</Text>

      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.waveBtn}>
          <Text style={styles.waveBtnText}>Wave</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.winkBtn}>
          <Text style={styles.winkBtnText}>Wink</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sparkBtn}>
          <Text style={styles.sparkBtnText}>Spark</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedUser(null)}>
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  ghostButton: { backgroundColor: '#1a1a2e', padding: 10, borderRadius: 20 },
  ghostActive: { backgroundColor: '#00ff88' },
  ghostIcon: { color: '#fff', fontSize: 14 },
  radarContainer: { width: 300, height: 300, alignSelf: 'center', marginTop: 20, position: 'relative' },
  radarOuter: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: '#00ff8855', justifyContent: 'center', alignItems: 'center' },
  radarMiddle: { width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: '#00ff8877', justifyContent: 'center', alignItems: 'center' },
  radarInner: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#00ff88', justifyContent: 'center', alignItems: 'center' },
  youDot: { color: '#00ff88', fontWeight: 'bold', fontSize: 12 },
  userDot: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: '#00ff88', justifyContent: 'center', alignItems: 'center' },
  userDotText: { color: '#00ff88', fontWeight: 'bold', fontSize: 14 },
  nearbyText: { color: '#00ff88', textAlign: 'center', padding: 20, fontSize: 14 },
  refreshBtn: { alignSelf: 'center', borderWidth: 1, borderColor: '#00ff88', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  refreshText: { color: '#00ff88', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
modalCard: { backgroundColor: '#0a0a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1a1a2e' },
modalAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#00ff88' },
modalAvatarText: { fontSize: 32, color: '#00ff88' },
modalName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
modalGender: { color: '#888', fontSize: 14, marginBottom: 8 },
modalTagline: { color: '#00ff88', fontSize: 16, fontStyle: 'italic', marginBottom: 8 },
modalDistance: { color: '#888', fontSize: 13, marginBottom: 24 },
modalButtons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
waveBtn: { flex: 1, borderWidth: 1, borderColor: '#00ff88', padding: 14, borderRadius: 12, alignItems: 'center' },
waveBtnText: { color: '#00ff88', fontWeight: 'bold' },
winkBtn: { flex: 1, borderWidth: 1, borderColor: '#00ff88', padding: 14, borderRadius: 12, alignItems: 'center' },
winkBtnText: { color: '#00ff88', fontWeight: 'bold' },
sparkBtn: { flex: 1, backgroundColor: '#00ff88', padding: 14, borderRadius: 12, alignItems: 'center' },
sparkBtnText: { color: '#0a0a1a', fontWeight: 'bold' },
closeBtn: { padding: 12 },
closeBtnText: { color: '#888', fontSize: 14 },
});