import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function PaywallScreen({ onClose, onSubscribe }) {
  const features = [
    { icon: 'Unlimited Sparks', desc: 'Send as many Sparks as you want' },
    { icon: 'See Who Waved', desc: 'Know exactly who noticed you' },
    { icon: 'Unlimited Posts', desc: 'Post as much as you want on the Feed' },
    { icon: 'All Openers', desc: 'Access every icebreaker in the collection' },
    { icon: 'Extended Radar', desc: 'See people up to 1km away' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sparkIcon}>
          <Text style={styles.sparkIconText}>⚡</Text>
        </View>

        <Text style={styles.title}>Wave Premium</Text>
        <Text style={styles.subtitle}>Spark sees more. So do you.</Text>

        <View style={styles.featuresCard}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{f.icon}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingCard}>
          <Text style={styles.price}>₹299</Text>
          <Text style={styles.pricePeriod}>per month</Text>
          <Text style={styles.priceNote}>Cancel anytime</Text>
        </View>

        <TouchableOpacity style={styles.subscribeBtn} onPress={onSubscribe}>
          <Text style={styles.subscribeBtnText}>Get Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  sparkIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#12121f', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#f5f0c0' },
  sparkIconText: { fontSize: 36 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#f5f0c0', fontSize: 16, marginBottom: 32, fontStyle: 'italic' },
  featuresCard: { width: '100%', backgroundColor: '#12121f', borderRadius: 20, padding: 20, marginBottom: 24, gap: 16, borderWidth: 1, borderColor: '#1a1a2e' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00e87a' },
  featureInfo: { flex: 1 },
  featureTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  featureDesc: { color: '#888', fontSize: 13, marginTop: 2 },
  pricingCard: { alignItems: 'center', marginBottom: 32 },
  price: { color: '#fff', fontSize: 42, fontWeight: 'bold' },
  pricePeriod: { color: '#888', fontSize: 16 },
  priceNote: { color: '#555', fontSize: 13, marginTop: 4 },
  subscribeBtn: { width: '100%', backgroundColor: '#f5f0c0', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  subscribeBtnText: { color: '#080810', fontWeight: 'bold', fontSize: 18 },
  closeBtn: { padding: 12 },
  closeBtnText: { color: '#888', fontSize: 14 },
});