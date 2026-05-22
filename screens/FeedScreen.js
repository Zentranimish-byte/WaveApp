import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import DiscoverScreen from './DiscoverScreen';
import NearbyPostsScreen from './NearbyPostsScreen';

export default function FeedScreen() {
  const [activeTab, setActiveTab] = useState('nearby');

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nearby' && styles.tabActive]}
          onPress={() => setActiveTab('nearby')}>
          <Text style={[styles.tabText, activeTab === 'nearby' && styles.tabTextActive]}>Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'foryou' && styles.tabActive]}
          onPress={() => setActiveTab('foryou')}>
          <Text style={[styles.tabText, activeTab === 'foryou' && styles.tabTextActive]}>For You</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'nearby' ? <NearbyPostsScreen /> : <DiscoverScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  tabRow: { flexDirection: 'row', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 0, gap: 24 },
  tab: { paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#00e87a' },
  tabText: { color: '#888', fontSize: 18, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
});