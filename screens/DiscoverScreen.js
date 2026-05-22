import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { buildProfile, calculateCompatibility } from '../services/matching';

export default function DiscoverScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    await fetchMatches(user.id);
  }

  async function fetchMatches(uid) {
    setLoading(true);
    const { data: myAnswers } = await supabase
      .from('preference_answers')
      .select('question_id, answer')
      .eq('user_id', uid);

    if (!myAnswers || myAnswers.length === 0) {
      setLoading(false);
      return;
    }

    const myAnswerMap = {};
    myAnswers.forEach(a => { myAnswerMap[a.question_id] = a.answer; });
    const myProfile = buildProfile(myAnswerMap);

    const { data: allUsers } = await supabase
      .from('profiles')
      .select('user_id, display_name, age, gender, tagline, here_for, currently_into')
      .neq('user_id', uid);

    if (!allUsers || allUsers.length === 0) {
      setLoading(false);
      return;
    }

    const results = [];
    for (const user of allUsers) {
      const { data: theirAnswers } = await supabase
        .from('preference_answers')
        .select('question_id, answer')
        .eq('user_id', user.user_id);

      if (!theirAnswers || theirAnswers.length === 0) continue;

      const theirAnswerMap = {};
      theirAnswers.forEach(a => { theirAnswerMap[a.question_id] = a.answer; });
      const theirProfile = buildProfile(theirAnswerMap);
      const score = calculateCompatibility(myProfile, theirProfile);

      if (score >= 50) {
        results.push({ ...user, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    await generateSparkPhrases(results);
  }

  async function generateSparkPhrases(results) {
    const withPhrases = await Promise.all(results.map(async (match) => {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 100,
            messages: [{
              role: 'user',
              content: `You are Spark, the Oracle of a dating app. Generate a single short phrase (max 15 words) about this match. Score: ${match.score}/100. Be warm, poetic, mystical. No percentages. No negative words. Frame differences as complementary. Make it feel like destiny. Only return the phrase, nothing else.`
            }]
          })
        });
        const data = await response.json();
        const phrase = data.content?.[0]?.text || 'Something worth exploring.';
        return { ...match, sparkPhrase: phrase };
      } catch (e) {
        return { ...match, sparkPhrase: 'Something worth exploring.' };
      }
    }));
    setMatches(withPhrases);
    setLoading(false);
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Spark is finding your people...</Text>
      <ActivityIndicator color="#f5f0c0" style={{ marginTop: 16 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>For You</Text>
      </View>

      {matches.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet.</Text>
          <Text style={styles.emptySubtext}>More people joining means better matches.</Text>
        </View>
      )}

      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {matches.map((match, index) => (
          <TouchableOpacity
            key={match.user_id}
            style={styles.matchCard}
            onPress={() => setSelectedMatch(selectedMatch?.user_id === match.user_id ? null : match)}>
            <View style={styles.cardFront}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{match.display_name?.charAt(0) || '?'}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.matchName}>{match.display_name}, {match.age}</Text>
                <Text style={styles.matchGender}>{match.gender}</Text>
              </View>
              <View style={styles.sparkPhrase}>
                <Text style={styles.sparkLabel}>Spark says</Text>
                <Text style={styles.sparkText}>{match.sparkPhrase}</Text>
              </View>
            </View>

            {selectedMatch?.user_id === match.user_id && (
              <View style={styles.cardBack}>
                <Text style={styles.cardBackTitle}>The Vibe</Text>
                {match.tagline && <Text style={styles.tagline}>"{match.tagline}"</Text>}
                {match.here_for && <Text style={styles.detail}>Here for: {match.here_for}</Text>}
                {match.currently_into && <Text style={styles.detail}>Into: {match.currently_into}</Text>}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.waveBtn}>
                    <Text style={styles.waveBtnText}>Wave</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sparkBtn}>
                    <Text style={styles.sparkBtnText}>Spark</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  loadingContainer: { flex: 1, backgroundColor: '#080810', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#f5f0c0', fontSize: 16, letterSpacing: 1 },
  header: { padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { color: '#888', fontSize: 14, textAlign: 'center' },
  feed: { padding: 16 },
  matchCard: { backgroundColor: '#12121f', borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1a1a2e' },
  cardFront: { padding: 20, flexDirection: 'column', gap: 16 },
  avatarLarge: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#080810', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#f5f0c0' },
  avatarText: { color: '#f5f0c0', fontSize: 28, fontWeight: 'bold' },
  cardInfo: { gap: 4 },
  matchName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  matchGender: { color: '#888', fontSize: 13 },
  sparkPhrase: { backgroundColor: '#080810', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2a2a1e' },
  sparkLabel: { color: '#f5f0c0', fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  sparkText: { color: '#fff', fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  cardBack: { borderTopWidth: 1, borderTopColor: '#1a1a2e', padding: 20, gap: 10 },
  cardBackTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  tagline: { color: '#f5f0c0', fontSize: 15, fontStyle: 'italic' },
  detail: { color: '#aaa', fontSize: 14 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  waveBtn: { flex: 1, borderWidth: 1, borderColor: '#00e87a', padding: 14, borderRadius: 12, alignItems: 'center' },
  waveBtnText: { color: '#00e87a', fontWeight: 'bold' },
  sparkBtn: { flex: 1, backgroundColor: '#f5f0c0', padding: 14, borderRadius: 12, alignItems: 'center' },
  sparkBtnText: { color: '#080810', fontWeight: 'bold' },
});