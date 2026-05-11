import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Feed</Text>
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>+ Post</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.feed}>
        <View style={styles.postCard}>
          <Text style={styles.postAuthor}>👤 anonymous</Text>
          <Text style={styles.postContent}>just smiled at someone at the library and they smiled back. peak romance.</Text>
          <TouchableOpacity style={styles.hookButton}>
            <Text style={styles.hookText}>🪝 12</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.postCard}>
          <Text style={styles.postAuthor}>👤 anonymous</Text>
          <Text style={styles.postContent}>why is everyone on campus wearing headphones. let me in.</Text>
          <TouchableOpacity style={styles.hookButton}>
            <Text style={styles.hookText}>🪝 34</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  postButton: { backgroundColor: '#00ff88', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  postButtonText: { color: '#0a0a1a', fontWeight: 'bold' },
  feed: { padding: 16 },
  postCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 16 },
  postAuthor: { color: '#888', marginBottom: 8 },
  postContent: { color: '#fff', fontSize: 16, lineHeight: 24, marginBottom: 12 },
  hookButton: { alignSelf: 'flex-start', backgroundColor: '#0a0a1a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  hookText: { color: '#00ff88', fontSize: 14 },
});