import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🧑</Text>
          </View>
          <Text style={styles.name}>Anura, 22</Text>
          <Text style={styles.gender}>Man</Text>
          <Text style={styles.tagline}>"Call me Chucky"</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>The Vibe</Text>
        <Text style={styles.currentlyInto}>🔥 Currently Into: Rewatching The Office</Text>

        <View style={styles.tilesRow}>
          <View style={styles.tile}><Text style={styles.tileEmoji}>🎵</Text><Text style={styles.tileText}>Hip-Hop / Indie</Text></View>
          <View style={styles.tile}><Text style={styles.tileEmoji}>🍜</Text><Text style={styles.tileText}>Spicy defender</Text></View>
        </View>
        <View style={styles.tilesRow}>
          <View style={styles.tile}><Text style={styles.tileEmoji}>🌙</Text><Text style={styles.tileText}>Night owl</Text></View>
          <View style={styles.tile}><Text style={styles.tileEmoji}>🧠</Text><Text style={styles.tileText}>Chaotic</Text></View>
        </View>
        <View style={styles.tilesRow}>
          <View style={styles.tile}><Text style={styles.tileEmoji}>💬</Text><Text style={styles.tileText}>Just vibing</Text></View>
          <View style={styles.tile}><Text style={styles.tileEmoji}>🍺</Text><Text style={styles.tileText}>Sometimes / No</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  settingsIcon: { fontSize: 22 },
  content: { padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#00ff88' },
  avatarEmoji: { fontSize: 50 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  gender: { color: '#888', fontSize: 14, marginTop: 2 },
  tagline: { color: '#00ff88', fontSize: 16, marginTop: 8, fontStyle: 'italic' },
  buttons: { marginBottom: 24 },
  editBtn: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#00ff88', padding: 12, borderRadius: 20, alignItems: 'center' },
  editBtnText: { color: '#00ff88', fontWeight: 'bold' },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
  currentlyInto: { color: '#fff', backgroundColor: '#1a1a2e', padding: 12, borderRadius: 12, marginBottom: 12 },
  tilesRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tile: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, alignItems: 'center' },
  tileEmoji: { fontSize: 24, marginBottom: 4 },
  tileText: { color: '#fff', fontSize: 12, textAlign: 'center' },
});