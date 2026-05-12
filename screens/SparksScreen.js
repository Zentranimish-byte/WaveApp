import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function SparksScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sparks</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Interactions Received</Text>
        <View style={styles.card}>
          <Text style={styles.avatar}>*</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>Aryan, 21</Text>
            <Text style={styles.cardAction}>waved at you</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Wave back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.avatar}>*</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>Priya, 20</Text>
            <Text style={styles.cardAction}>sparked you</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Spark back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Matches</Text>
        <View style={styles.card}>
          <Text style={styles.avatar}>*</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>Meera, 22</Text>
            <Text style={styles.cardAction}>Say hello</Text>
          </View>
          <TouchableOpacity style={styles.chatBtn}>
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
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
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 32, marginRight: 12, color: '#fff' },
  cardInfo: { flex: 1 },
  cardName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardAction: { color: '#888', fontSize: 13, marginTop: 2 },
  actionBtn: { borderWidth: 1, borderColor: '#00ff88', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  actionBtnText: { color: '#00ff88', fontSize: 12 },
  chatBtn: { backgroundColor: '#00ff88', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chatBtnText: { color: '#0a0a1a', fontWeight: 'bold', fontSize: 12 },
});