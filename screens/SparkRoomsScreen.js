import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import RoomScreen from './RoomScreen';

export default function SparkRoomsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    const { data: profileData } = await supabase.from('profiles').select('display_name, avatar_url').eq('user_id', user.id).single();
    setProfile(profileData);
    fetchRooms();
  }

  async function fetchRooms() {
    const { data } = await supabase
      .from('spark_rooms')
      .select('*, room_users(count)')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });
    setRooms(data || []);
    setLoading(false);
  }

  async function joinRoom() {
    setJoining(true);
    const { data: waitingRooms } = await supabase
      .from('spark_rooms')
      .select('*, room_users(count)')
      .eq('status', 'waiting')
      .limit(1);

    let room;

    if (waitingRooms && waitingRooms.length > 0) {
      const existingRoom = waitingRooms[0];
      const userCount = existingRoom.room_users[0]?.count || 0;
      if (userCount < existingRoom.max_users) {
        room = existingRoom;
      }
    }

    if (!room) {
      const { data: newRoom } = await supabase
        .from('spark_rooms')
        .insert({ status: 'waiting', current_game: 'this_or_that', current_round: 0 })
        .select()
        .single();
      room = newRoom;
    }

    await supabase.from('room_users').upsert({
      room_id: room.id,
      user_id: userId,
    }, { onConflict: 'room_id,user_id' });

    setJoining(false);
    setActiveRoom(room);
  }

  if (activeRoom) return (
    <RoomScreen
      room={activeRoom}
      userId={userId}
      profile={profile}
      onLeave={() => setActiveRoom(null)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Spark Rooms</Text>
        <Text style={styles.headerSub}>Play games. Meet people. Let chemistry happen.</Text>
      </View>

      <View style={styles.joinCard}>
        <Text style={styles.joinTitle}>Ready to spark?</Text>
        <Text style={styles.joinDesc}>Join a live room with up to 12 people. Play games. Wave at whoever caught your eye.</Text>
        <TouchableOpacity style={styles.joinBtn} onPress={joinRoom} disabled={joining}>
          {joining ? <ActivityIndicator color="#080810" /> : <Text style={styles.joinBtnText}>Join a Room</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Live Rooms</Text>
      {loading ? <ActivityIndicator color="#f5f0c0" style={{ marginTop: 20 }} /> : null}

      <ScrollView style={styles.roomsList}>
        {rooms.length === 0 && !loading && (
          <Text style={styles.emptyText}>No active rooms. Create one by joining!</Text>
        )}
        {rooms.map(room => (
          <TouchableOpacity key={room.id} style={styles.roomCard} onPress={joinRoom}>
            <View style={styles.roomInfo}>
              <Text style={styles.roomGame}>This or That</Text>
              <Text style={styles.roomStatus}>Waiting for players</Text>
            </View>
            <View style={styles.roomCount}>
              <Text style={styles.roomCountText}>{room.room_users[0]?.count || 0}/12</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  header: { padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#888', fontSize: 13, marginTop: 4 },
  joinCard: { margin: 16, backgroundColor: '#12121f', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#f5f0c0' },
  joinTitle: { color: '#f5f0c0', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  joinDesc: { color: '#888', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  joinBtn: { backgroundColor: '#f5f0c0', padding: 16, borderRadius: 14, alignItems: 'center' },
  joinBtnText: { color: '#080810', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 },
  roomsList: { padding: 16 },
  emptyText: { color: '#444', fontSize: 14, textAlign: 'center', marginTop: 20 },
  roomCard: { backgroundColor: '#12121f', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1a1a2e' },
  roomInfo: { flex: 1 },
  roomGame: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  roomStatus: { color: '#888', fontSize: 13, marginTop: 2 },
  roomCount: { backgroundColor: '#080810', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  roomCountText: { color: '#f5f0c0', fontWeight: 'bold' },
});