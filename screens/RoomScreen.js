import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

const THIS_OR_THAT_PROMPTS = [
  { id: 1, optionA: 'Mountains', optionB: 'Beach' },
  { id: 2, optionA: '3AM', optionB: '6AM' },
  { id: 3, optionA: 'Call', optionB: 'Text' },
  { id: 4, optionA: 'Chaos', optionB: 'Routine' },
  { id: 5, optionA: 'One best friend', optionB: 'Many friends' },
  { id: 6, optionA: 'Rewatch comfort show', optionB: 'Always something new' },
  { id: 7, optionA: 'Loud restaurant', optionB: 'Quiet cafe' },
  { id: 8, optionA: 'Gut feeling', optionB: 'Think it through' },
  { id: 9, optionA: 'Early bird', optionB: 'Night owl' },
  { id: 10, optionA: 'City', optionB: 'Small town' },
];

export default function RoomScreen({ room, userId, profile, onLeave }) {
  const [users, setUsers] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [roundAnswers, setRoundAnswers] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [revealedCards, setRevealedCards] = useState([]);
  const [timer, setTimer] = useState(5);
  const [phase, setPhase] = useState('waiting');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [waves, setWaves] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [compatibilityScores, setCompatibilityScores] = useState({});
  const timerRef = useRef(null);
  const channelRef = useRef(null);
  const roundIndexRef = useRef(0);
  const revealedRef = useRef(false);

  useEffect(() => {
    fetchUsers();
    setupRealtime();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('room_users')
      .select('user_id')
      .eq('room_id', room.id);
    if (!data || data.length === 0) return;
    const userIds = data.map(u => u.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);
    const combined = data.map(u => ({
      user_id: u.user_id,
      profiles: profiles?.find(p => p.user_id === u.user_id) || null
    }));
    setUsers(combined);
    setPhase('playing');
    startTimer();
  }

  function setupRealtime() {
    const channel = supabase.channel(`room:${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_users', filter: `room_id=eq.${room.id}` }, () => fetchUsers())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_chat', filter: `room_id=eq.${room.id}` }, (payload) => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_waves', filter: `room_id=eq.${room.id}` }, (payload) => {
        setWaves(prev => [...prev, payload.new]);
      })
      .subscribe();
    channelRef.current = channel;
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(5);
    revealedRef.current = false;
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!revealedRef.current) {
            revealedRef.current = true;
            triggerReveal(roundIndexRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function selectAnswer(answer) {
    if (selectedAnswer || revealed) return;
    setSelectedAnswer(answer);
    await supabase.from('room_answers').insert({
      room_id: room.id,
      user_id: userId,
      round_number: roundIndexRef.current,
      prompt: `${THIS_OR_THAT_PROMPTS[roundIndexRef.current].optionA} vs ${THIS_OR_THAT_PROMPTS[roundIndexRef.current].optionB}`,
      answer,
    });
  }

  async function triggerReveal(currentRound) {
    const { data: allAnswers } = await supabase
      .from('room_answers')
      .select('*')
      .eq('room_id', room.id)
      .eq('round_number', currentRound);

    const answers = allAnswers || [];
    setRoundAnswers(answers);
    setRevealed(true);

    setRevealedCards([]);
    answers.forEach((_, i) => {
      setTimeout(() => {
        setRevealedCards(prev => [...prev, i]);
      }, i * 300);
    });

    updateCompatibilityScores(answers);

    setTimeout(() => {
      const next = currentRound + 1;
      if (next >= THIS_OR_THAT_PROMPTS.length) {
        setShowResults(true);
        return;
      }
      roundIndexRef.current = next;
      setRoundIndex(next);
      setSelectedAnswer(null);
      setRevealed(false);
      setRoundAnswers([]);
      setRevealedCards([]);
      startTimer();
    }, 4000);
  }

  function updateCompatibilityScores(answers) {
    setCompatibilityScores(prev => {
      const updated = { ...prev };
      for (let i = 0; i < answers.length; i++) {
        for (let j = i + 1; j < answers.length; j++) {
          const a = answers[i];
          const b = answers[j];
          if (a.user_id === b.user_id) continue;
          const key = [a.user_id, b.user_id].sort().join('_');
          if (a.answer === b.answer) {
            updated[key] = (updated[key] || 0) + 10;
          }
        }
      }
      return updated;
    });
  }

  function getTopMatch() {
    let topKey = null;
    let topScore = 0;
    Object.entries(compatibilityScores).forEach(([key, score]) => {
      if (key.includes(userId) && score > topScore) {
        topScore = score;
        topKey = key;
      }
    });
    if (!topKey) return null;
    const otherId = topKey.split('_').find(id => id !== userId);
    const otherUser = users.find(u => u.user_id === otherId);
    return { user: otherUser, score: topScore };
  }

  async function sendChat() {
    if (!chatInput.trim()) return;
    await supabase.from('room_chat').insert({
      room_id: room.id,
      user_id: userId,
      message: chatInput.trim(),
    });
    setChatInput('');
  }

  async function sendWave(receiverId) {
    if (receiverId === userId) return;
    try {
      await supabase.from('room_waves').insert({
        room_id: room.id,
        sender_id: userId,
        receiver_id: receiverId,
      });
    } catch (e) {}
  }

  const currentPrompt = THIS_OR_THAT_PROMPTS[roundIndex];
  const myAnswer = selectedAnswer;
  const optionAAnswers = roundAnswers.filter(a => a.answer === currentPrompt.optionA);
  const optionBAnswers = roundAnswers.filter(a => a.answer === currentPrompt.optionB);
  const optionACount = optionAAnswers.length;
  const optionBCount = optionBAnswers.length;
  const totalAnswers = optionACount + optionBCount;
  const topMatch = getTopMatch();

  if (showResults) return (
    <View style={styles.container}>
      <View style={styles.resultsScreen}>
        <Text style={styles.resultsTitle}>Room's over!</Text>
        {topMatch && (
          <View style={styles.topMatchCard}>
            <Text style={styles.topMatchLabel}>YOUR TOP SPARK</Text>
            <View style={styles.topMatchAvatar}>
              <Text style={styles.topMatchAvatarText}>
                {topMatch.user?.profiles?.display_name?.charAt(0) || '?'}
              </Text>
            </View>
            <Text style={styles.topMatchName}>{topMatch.user?.profiles?.display_name || 'Someone'}</Text>
            <Text style={styles.topMatchScore}>{topMatch.score} spark points</Text>
          </View>
        )}
        <Text style={styles.resultsSub}>Everyone in your room</Text>
        <ScrollView style={styles.usersList}>
          {users.filter(u => u.user_id !== userId).map(u => {
            const waveSent = waves.find(w => w.sender_id === userId && w.receiver_id === u.user_id);
            const waveReceived = waves.find(w => w.sender_id === u.user_id && w.receiver_id === userId);
            const matched = waveSent && waveReceived;
            const pairKey = [userId, u.user_id].sort().join('_');
            const pairScore = compatibilityScores[pairKey] || 0;
            return (
              <View key={u.user_id} style={styles.resultUserCard}>
                <View style={styles.resultAvatar}>
                  <Text style={styles.resultAvatarText}>{u.profiles?.display_name?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{u.profiles?.display_name || 'Someone'}</Text>
                  {pairScore > 0 && <Text style={styles.resultScore}>{pairScore} pts in common</Text>}
                </View>
                {matched && <Text style={styles.matchedTag}>Matched!</Text>}
                {!waveSent && (
                  <TouchableOpacity style={styles.waveBtn} onPress={() => sendWave(u.user_id)}>
                    <Text style={styles.waveBtnText}>Wave</Text>
                  </TouchableOpacity>
                )}
                {waveSent && !matched && <Text style={styles.wavedTag}>Waved</Text>}
              </View>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
          <Text style={styles.leaveBtnText}>Back to Lobby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (phase === 'waiting') return (
    <View style={styles.container}>
      <View style={styles.waitingScreen}>
        <Text style={styles.waitingTitle}>Setting up room...</Text>
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
          <Text style={styles.leaveBtnText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onLeave}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
        <Text style={styles.roomTitle}>Spark Room</Text>
        <TouchableOpacity onPress={() => setShowChat(!showChat)}>
          <Text style={styles.chatToggle}>{showChat ? 'Hide' : 'Chat'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerBarContainer}>
        <View style={[styles.timerFill, { width: `${(timer / 5) * 100}%` }]} />
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.roundText}>Round {roundIndex + 1} of {THIS_OR_THAT_PROMPTS.length}</Text>
        <Text style={styles.vsText}>THIS OR THAT</Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionBtn,
              myAnswer === currentPrompt.optionA && styles.optionSelected,
              revealed && optionACount > optionBCount && styles.optionWinner,
              revealed && optionACount === optionBCount && optionACount > 0 && styles.optionTie,
            ]}
            onPress={() => selectAnswer(currentPrompt.optionA)}
            disabled={!!selectedAnswer || revealed}>
            <Text style={styles.optionText}>{currentPrompt.optionA}</Text>
            {revealed && <Text style={styles.optionCount}>{optionACount} voted</Text>}
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity
            style={[
              styles.optionBtn,
              myAnswer === currentPrompt.optionB && styles.optionSelected,
              revealed && optionBCount > optionACount && styles.optionWinner,
              revealed && optionACount === optionBCount && optionBCount > 0 && styles.optionTie,
            ]}
            onPress={() => selectAnswer(currentPrompt.optionB)}
            disabled={!!selectedAnswer || revealed}>
            <Text style={styles.optionText}>{currentPrompt.optionB}</Text>
            {revealed && <Text style={styles.optionCount}>{optionBCount} voted</Text>}
          </TouchableOpacity>
        </View>

        {revealed && totalAnswers > 0 && (
          <Text style={styles.splitText}>
            {Math.round((optionACount / totalAnswers) * 100)}% chose {currentPrompt.optionA}
          </Text>
        )}

        {revealed && roundAnswers.length > 0 && (
          <View style={styles.answersGrid}>
            {roundAnswers.map((answer, i) => {
              const user = users.find(u => u.user_id === answer.user_id);
              const isVisible = revealedCards.includes(i);
              const isMatch = myAnswer && answer.answer === myAnswer && answer.user_id !== userId;
              return (
                <View key={`${answer.user_id}_${i}`} style={[
                  styles.answerCard,
                  isVisible && styles.answerCardVisible,
                  isMatch && styles.answerCardMatch
                ]}>
                  <Text style={styles.answerCardName}>{user?.profiles?.display_name?.charAt(0) || '?'}</Text>
                  <Text style={styles.answerCardAnswer}>{answer.answer}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <ScrollView style={styles.usersRow} horizontal showsHorizontalScrollIndicator={false}>
        {users.map(u => {
          const pairKey = [userId, u.user_id].sort().join('_');
          const pairScore = compatibilityScores[pairKey] || 0;
          const waveSent = waves.find(w => w.sender_id === userId && w.receiver_id === u.user_id);
          return (
            <TouchableOpacity key={u.user_id} style={styles.userChip} onPress={() => sendWave(u.user_id)}>
              <View style={[styles.userAvatar, pairScore > 20 && styles.userAvatarGlow]}>
                <Text style={styles.userAvatarText}>{u.profiles?.display_name?.charAt(0) || '?'}</Text>
              </View>
              <Text style={styles.userName} numberOfLines={1}>{u.profiles?.display_name || '?'}</Text>
              {pairScore > 0 && u.user_id !== userId && (
                <View style={[styles.scoreBar, { width: Math.min(pairScore * 2, 40) }]} />
              )}
              {waveSent && <Text style={styles.wavedIndicator}>waved</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {showChat && (
        <View style={styles.chatPanel}>
          <ScrollView style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <Text key={i} style={styles.chatMessage}>
                <Text style={styles.chatSender}>
                  {msg.user_id === userId ? 'You' : users.find(u => u.user_id === msg.user_id)?.profiles?.display_name || 'Someone'}: 
                </Text>
                {msg.message}
              </Text>
            ))}
          </ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Say something..."
              placeholderTextColor="#555"
              value={chatInput}
              onChangeText={setChatInput}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={sendChat}>
              <Text style={styles.chatSendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  leaveText: { color: '#888', fontSize: 14 },
  roomTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatToggle: { color: '#f5f0c0', fontSize: 14 },
  timerBarContainer: { height: 3, backgroundColor: '#1a1a2e', marginHorizontal: 16 },
  timerFill: { height: 3, backgroundColor: '#f5f0c0' },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  roundText: { color: '#888', fontSize: 13, marginBottom: 8 },
  vsText: { color: '#f5f0c0', fontSize: 14, fontWeight: 'bold', marginBottom: 32, letterSpacing: 3 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  optionBtn: { flex: 1, backgroundColor: '#12121f', borderWidth: 1, borderColor: '#333', padding: 20, borderRadius: 16, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  optionSelected: { borderColor: '#f5f0c0', backgroundColor: '#1a1a10' },
  optionWinner: { borderColor: '#00e87a', backgroundColor: '#0a1a10' },
  optionTie: { borderColor: '#f5f0c0' },
  optionText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  optionCount: { color: '#888', fontSize: 12, marginTop: 8 },
  orText: { color: '#555', fontSize: 14, fontWeight: 'bold' },
  splitText: { color: '#888', fontSize: 13, marginTop: 16 },
  answersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  answerCard: { backgroundColor: '#12121f', borderRadius: 10, padding: 8, alignItems: 'center', width: 70, opacity: 0, borderWidth: 1, borderColor: '#333' },
  answerCardVisible: { opacity: 1 },
  answerCardMatch: { borderColor: '#f5f0c0', backgroundColor: '#1a1a10' },
  answerCardName: { color: '#f5f0c0', fontWeight: 'bold', fontSize: 12 },
  answerCardAnswer: { color: '#888', fontSize: 10, marginTop: 2, textAlign: 'center' },
  usersRow: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 100 },
  userChip: { alignItems: 'center', marginRight: 16, width: 56 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#12121f', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  userAvatarGlow: { borderColor: '#f5f0c0', borderWidth: 2 },
  userAvatarText: { color: '#f5f0c0', fontWeight: 'bold', fontSize: 16 },
  userName: { color: '#888', fontSize: 10, marginTop: 4, textAlign: 'center' },
  scoreBar: { height: 2, backgroundColor: '#f5f0c0', borderRadius: 1, marginTop: 2 },
  wavedIndicator: { color: '#f5f0c0', fontSize: 9, marginTop: 2 },
  chatPanel: { backgroundColor: '#12121f', borderTopWidth: 1, borderTopColor: '#1a1a2e', maxHeight: 250 },
  chatMessages: { padding: 12, maxHeight: 180 },
  chatMessage: { color: '#aaa', fontSize: 13, marginBottom: 6 },
  chatSender: { color: '#f5f0c0', fontWeight: 'bold' },
  chatInputRow: { flexDirection: 'row', padding: 8, gap: 8 },
  chatInput: { flex: 1, backgroundColor: '#080810', color: '#fff', padding: 10, borderRadius: 10, fontSize: 14, borderWidth: 1, borderColor: '#333' },
  chatSendBtn: { backgroundColor: '#f5f0c0', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  chatSendText: { color: '#080810', fontWeight: 'bold', fontSize: 13 },
  waitingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  waitingTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  resultsScreen: { flex: 1, padding: 24, paddingTop: 60 },
  resultsTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  topMatchCard: { backgroundColor: '#12121f', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#f5f0c0' },
  topMatchLabel: { color: '#f5f0c0', fontSize: 11, letterSpacing: 1, marginBottom: 12 },
  topMatchAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#080810', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#f5f0c0', marginBottom: 8 },
  topMatchAvatarText: { color: '#f5f0c0', fontSize: 28, fontWeight: 'bold' },
  topMatchName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  topMatchScore: { color: '#888', fontSize: 13, marginTop: 4 },
  resultsSub: { color: '#888', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12 },
  usersList: { flex: 1 },
  resultUserCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121f', borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
  resultAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#080810', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f5f0c0' },
  resultAvatarText: { color: '#f5f0c0', fontWeight: 'bold', fontSize: 18 },
  resultInfo: { flex: 1 },
  resultName: { color: '#fff', fontWeight: 'bold' },
  resultScore: { color: '#f5f0c0', fontSize: 12, marginTop: 2 },
  matchedTag: { color: '#00e87a', fontSize: 12, fontWeight: 'bold' },
  wavedTag: { color: '#f5f0c0', fontSize: 12 },
  waveBtn: { borderWidth: 1, borderColor: '#f5f0c0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  waveBtnText: { color: '#f5f0c0', fontSize: 12, fontWeight: 'bold' },
  leaveBtn: { backgroundColor: '#12121f', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#333' },
  leaveBtnText: { color: '#888', fontWeight: 'bold' },
});