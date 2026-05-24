import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, ClipPath, Rect, Defs } from 'react-native-svg';

const MALE_PATH = "M100,20 C115,20 128,33 128,48 C128,63 115,76 100,76 C85,76 72,63 72,48 C72,33 85,20 100,20 Z M60,90 C60,82 78,78 100,78 C122,78 140,82 140,90 L148,180 C148,185 144,188 140,188 L130,188 L125,240 C125,244 122,247 118,247 L82,247 C78,247 75,244 75,240 L70,188 L60,188 C56,188 52,185 52,180 Z";

const FEMALE_PATH = "M100,20 C115,20 128,33 128,48 C128,63 115,76 100,76 C85,76 72,63 72,48 C72,33 85,20 100,20 Z M65,90 C65,82 80,78 100,78 C120,78 135,82 135,90 L145,155 C145,160 141,163 137,163 L120,163 L130,210 C132,216 128,220 122,220 L115,220 L115,247 C115,251 112,254 108,254 L92,254 C88,254 85,251 85,247 L85,220 L78,220 C72,220 68,216 70,210 L80,163 L63,163 C59,163 55,160 55,155 Z";

const NEUTRAL_PATH = "M100,20 C115,20 128,33 128,48 C128,63 115,76 100,76 C85,76 72,63 72,48 C72,33 85,20 100,20 Z M62,90 C62,82 79,78 100,78 C121,78 138,82 138,90 L146,175 C146,180 142,183 138,183 L125,183 L128,240 C128,244 125,247 121,247 L79,247 C75,247 72,244 72,240 L75,183 L62,183 C58,183 54,180 54,175 Z";

const COLORS = ['#FF6B9D', '#C77DFF', '#48CAE4', '#F4A261', '#06D6A0', '#FFD166', '#EF476F', '#118AB2', '#9B5DE5', '#00F5D4'];

export default function PersonalityVessel({ entries, gender, onAdd, onDelete }) {
  const path = gender === 'Woman' ? FEMALE_PATH : gender === 'Man' ? MALE_PATH : NEUTRAL_PATH;
  const isComplete = entries.length >= 7;
  const totalPct = entries.reduce((sum, e) => sum + e.percentage, 0);
  const VESSEL_HEIGHT = 260;

  let yOffset = VESSEL_HEIGHT;
  const layers = entries.map((entry) => {
    const proportion = entry.percentage / (totalPct || 1);
    const layerHeight = Math.max(15, proportion * VESSEL_HEIGHT);
    yOffset -= layerHeight;
    const midY = yOffset + layerHeight / 2;
    return { ...entry, layerHeight, yOffset, midY };
  });

  const leftLayers = layers.filter((_, i) => i % 2 === 0);
  const rightLayers = layers.filter((_, i) => i % 2 === 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Vessel</Text>
      <Text style={styles.subtitle}>What are you made of?</Text>

      <View style={styles.vesselRow}>
        <View style={styles.leftLabels}>
          {leftLayers.map(entry => (
            <View key={entry.id} style={styles.labelLeft}>
              <Text style={[styles.labelText, { color: entry.color }]} numberOfLines={2}>{entry.label}</Text>
              <Text style={[styles.labelPct, { color: entry.color }]}>{entry.percentage}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.vesselWrapper}>
          <Svg width={200} height={270} viewBox="0 0 200 270">
            <Defs>
              <ClipPath id="silhouette">
                <Path d={path} />
              </ClipPath>
            </Defs>
            <Path d={path} fill="#12121f" stroke="#2a2a3e" strokeWidth={1.5} />
            {layers.map((entry) => (
              <Rect
                key={entry.id}
                x={0}
                y={entry.yOffset}
                width={200}
                height={entry.layerHeight}
                fill={entry.color}
                opacity={0.88}
                clipPath="url(#silhouette)"
              />
            ))}
            <Path d={path} fill="none" stroke="#555" strokeWidth={1.5} />
          </Svg>
          <Text style={styles.count}>{entries.length}/7 minimum</Text>
        </View>

        <View style={styles.rightLabels}>
          {rightLayers.map(entry => (
            <View key={entry.id} style={styles.labelRight}>
              <Text style={[styles.labelText, { color: entry.color }]} numberOfLines={2}>{entry.label}</Text>
              <Text style={[styles.labelPct, { color: entry.color }]}>{entry.percentage}%</Text>
            </View>
          ))}
        </View>
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
        {entries.map(entry => (
          <View key={entry.id} style={[styles.entryChip, { borderColor: entry.color }]}>
            <View style={[styles.colorDot, { backgroundColor: entry.color }]} />
            <Text style={styles.entryLabel} numberOfLines={1}>{entry.label}</Text>
            <Text style={styles.entryPct}>{entry.percentage}%</Text>
            <TouchableOpacity onPress={() => onDelete(entry.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>x</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnText}>+ Add to your vessel</Text>
      </TouchableOpacity>

      {!isComplete && entries.length > 0 && (
        <Text style={styles.hint}>{Math.max(0, 7 - entries.length)} more to unlock your vessel</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 13, marginBottom: 20 },
  vesselRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  leftLabels: { width: 75, alignItems: 'flex-end', justifyContent: 'space-around', paddingRight: 6, alignSelf: 'stretch', paddingVertical: 20 },
  rightLabels: { width: 75, alignItems: 'flex-start', justifyContent: 'space-around', paddingLeft: 6, alignSelf: 'stretch', paddingVertical: 20 },
  labelLeft: { alignItems: 'flex-end', marginBottom: 12 },
  labelRight: { alignItems: 'flex-start', marginBottom: 12 },
  labelText: { fontSize: 10, fontWeight: 'bold', textAlign: 'right' },
  labelPct: { fontSize: 9, opacity: 0.8 },
  vesselWrapper: { alignItems: 'center' },
  count: { color: '#888', fontSize: 11, marginTop: 6, textAlign: 'center' },
  completeCard: { backgroundColor: '#12121f', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f5f0c0' },
  completeTitle: { color: '#f5f0c0', fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  completeText: { color: '#aaa', fontSize: 12, lineHeight: 18 },
  entriesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  entryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#12121f', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  entryLabel: { color: '#fff', fontSize: 13, maxWidth: 100 },
  entryPct: { color: '#888', fontSize: 12 },
  deleteBtn: { marginLeft: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 12 },
  addBtn: { borderWidth: 1, borderColor: '#a29bfe', padding: 14, borderRadius: 16, alignItems: 'center', marginBottom: 8 },
  addBtnText: { color: '#a29bfe', fontWeight: 'bold', fontSize: 15 },
  hint: { color: '#555', textAlign: 'center', fontSize: 12, marginBottom: 16 },
});