import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function RadarScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Wave</Text>
        <TouchableOpacity style={styles.ghostButton}>
          <Text style={styles.ghostIcon}>👻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.radarContainer}>
        <View style={styles.radarOuter}>
          <View style={styles.radarMiddle}>
            <View style={styles.radarInner}>
              <Text style={styles.radarDot}>📡</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.nearbyText}>Scanning for people nearby...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  ghostButton: { backgroundColor: '#1a1a2e', padding: 10, borderRadius: 20 },
  ghostIcon: { fontSize: 20 },
  radarContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  radarOuter: { width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: '#00ff88', justifyContent: 'center', alignItems: 'center' },
  radarMiddle: { width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: '#00ff88', justifyContent: 'center', alignItems: 'center' },
  radarInner: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#00ff88', justifyContent: 'center', alignItems: 'center' },
  radarDot: { fontSize: 30 },
  nearbyText: { color: '#00ff88', textAlign: 'center', padding: 20, fontSize: 14 },
});