import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  const [currentPrompt, setCurrentPrompt] = useState(THIS_OR_THAT_PROMPTS[0]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(5);
  const [phase, setPhase] = useState('waiting');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [waves, setWaves] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    setupRealtime();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('room_users')
      .select('user_id, profiles(display_name)')
      .eq('room_id', room.id);
    setUsers(data || []);
    if (data && data.length >= 2) startGame();
  }

  function setupRealtime() {
    const channel = supabase.channel(`room:${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_users', filter: `room_id=eq.${room.id}` }, () => fetchUsers())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_answers', filter: `room_id=eq.${room.id}` }, (payload) => {
        setAnswers(prev => {
          const exists = prev.find(a => a.user_id === payload.new.user_id && a.round_number === payload.new.round_number);
          if (exists) return prev;
          return [...prev, payload.new];
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_chat', filter: `room_id=eq.${room.id}` }, (payload) => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_waves', filter: `room_id=eq.${room.id}` }, (payload) => {
        setWaves(prev => [...prev, payload.new]);
      })
      .subscribe();
    channelRef.current = channel;
  }

  function startGame() {
    setPhase('playing');
    setTimer(5);
    startTimer();
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(5);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          revealAnswers();
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
      round_number: roundIndex,
      prompt: `${currentPrompt.optionA} vs ${currentPrompt.optionB}`,
      answer,
    });
  }

  function revealAnswers() {
    setRevealed(true);
    setTimeout(() => nextRound(), 3000);
  }

  function nextRound() {
    const next = roundIndex + 1;
    if (next >= THIS_OR_THAT_PROMPTS.length) {
      setShowResults(true);
      return;
    }
    setRoundIndex(next);
    setCurrentPrompt(THIS_OR_THAT_PROMPTS[next]);
    setSelectedAnswer(null);
    setRevealed(false);
    setAnswers(prev => prev.filter(a => a.round_number !== roundIndex));
    startTimer();
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
    await supabase.from('room_waves').insert({
      room_id: room.id,
      sender_id: userId,
      receiver_id: receiverId,
    });
  }

  const roundAnswers = answers.filter(a => a.round_number === roundIndex);
  const optionACount = roundAnswers.filter(a => a.answer === currentPrompt.optionA).length;
  const optionBCount = roundAnswers.filter(a => a.answer === currentPrompt.optionB).length;
  const totalAnswers = optionACount + optionBCount;

  if (showResults) return (
    <View style={styles.container}>
      <View style={styles.resultsScreen}>
        <Text style={styles.resultsTitle}>Room's over!</Text>
        <Text style={styles.resultsSub}>Here's who was in your room</Text>
        <ScrollView style={styles.usersList}>
          {users.map(u => {
            const waveReceived = waves.find(w => w.sender_id === u.user_id && w.receiver_id === userId);
            const waveSent = waves.find(w => w.sender_id === userId && w.receiver_id === u.user_id);
            const matched = waveReceived && waveSent;
            return (
              <View key={u.user_id} style={styles.resultUserCard}>
                <View style={styles.resultAvatar}>
                  <Text style={styles.resultAvatarText}>{u.profiles?.display_name?.charAt(0) || '?'}</Text>
                </View>
                <Text style={styles.resultName}>{u.profiles?.display_name || 'Someone'}</Text>
                {matched && <Text style={styles.matchedTag}>Matched!</Text>}
                {!waveSent && u.user_id !== userId && (
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onLeave}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
        <Text style={styles.roomTitle}>Spark Room</Text>
        <TouchableOpacity onPress={() => setShowChat(!showChat)}>
          <Text style={styles.chatToggle}>Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerBar}>
        <View style={[styles.timerFill, { width: `${(timer / 5) * 100}%` }]} />
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.roundText}>Round {roundIndex + 1} of {THIS_OR_THAT_PROMPTS.length}</Text>
        <Text style={styles.vsText}>This or That</Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.optionBtn, selectedAnswer === currentPrompt.optionA && styles.optionSelected, revealed && optionACount > optionBCount && styles.optionWinner]}
            onPress={() => selectAnswer(currentPrompt.optionA)}
            disabled={!!selectedAnswer || revealed}>
            <Text style={styles.optionText}>{currentPrompt.optionA}</Text>
            {revealed && <Text style={styles.optionCount}>{optionACount} voted</Text>}
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity
            style={[styles.optionBtn, selectedAnswer === currentPrompt.optionB && styles.optionSelected, revealed && optionBCount > optionACount && styles.optionWinner]}
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
      </View>

      <ScrollView style={styles.usersRow} horizontal showsHorizontalScrollIndicator={false}>
        {users.map(u => (
          <TouchableOpacity key={u.user_id} style={styles.userChip} onPress={() => sendWave(u.user_id)}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{u.profiles?.display_name?.charAt(0) || '?'}</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>{u.profiles?.display_name || '?'}</Text>
            {waves.find(w => w.sender_id === userId && w.receiver_id === u.user_id) && (
              <Text style={styles.wavedIndicator}>waved</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showChat && (
        <View style={styles.chatPanel}>
          <ScrollView style={styles.chatMessages}>
            {chatMessages.map(msg => (
              <Text key={msg.id} style={styles.chatMessage}>
                <Text style={styles.chatSender}>{msg.user_id === userId ? 'You' : 'Someone'}: </Text>
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
  timerBar: { height: 3, backgroundColor: '#1a1a2e', marginHorizontal: 16 },
  timerFill: { height: 3, backgroundColor: '#f5f0c0' },
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  roundText: { color: '#888', fontSize: 13, marginBottom: 8 },
  vsText: { color: '#f5f0c0', fontSize: 16, fontWeight: 'bold', marginBottom: 40, letterSpacing: 2 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  optionBtn: { flex: 1, backgroundColor: '#12121f', borderWidth: 1, borderColor: '#333', padding: 20, borderRadius: 16, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  optionSelected: { borderColor: '#f5f0c0', backgroundColor: '#1a1a10' },
  optionWinner: { borderColor: '#00e87a', backgroundColor: '#0a1a10' },
  optionText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  optionCount: { color: '#888', fontSize: 12, marginTop: 8 },
  orText: { color: '#555', fontSize: 14, fontWeight: 'bold' },
  splitText: { color: '#888', fontSize: 13, marginTop: 20 },
  usersRow: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 90 },
  userChip: { alignItems: 'center', marginRight: 16, width: 56 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#12121f', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  userAvatarText: { color: '#f5f0c0', fontWeight: 'bold', fontSize: 16 },
  userName: { color: '#888', fontSize: 10, marginTop: 4, textAlign: 'center' },
  wavedIndicator: { color: '#f5f0c0', fontSize: 9, marginTop: 2 },
  chatPanel: { backgroundColor: '#12121f', borderTopWidth: 1, borderTopColor: '#1a1a2e', maxHeight: 250 },
  chatMessages: { padding: 12, maxHeight: 180 },
  chatMessage: { color: '#aaa', fontSize: 13, marginBottom: 6 },
  chatSender: { color: '#f5f0c0', fontWeight: 'bold' },
  chatInputRow: { flexDirection: 'row', padding: 8, gap: 8 },
  chatInput: { flex: 1, backgroundColor: '#080810', color: '#fff', padding: 10, borderRadius: 10, fontSize: 14, borderWidth: 1, borderColor: '#333' },
  chatSendBtn: { backgroundColor: '#f5f0c0', paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  chatSendText: { color: '#080810', fontWeight: 'bold', fontSize: 13 },
  resultsScreen: { flex: 1, padding: 24, paddingTop: 60 },
  resultsTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  resultsSub: { color: '#888', fontSize: 14, marginBottom: 24 },
  usersList: { flex: 1 },
  resultUserCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121f', borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
  resultAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#080810', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f5f0c0' },
  resultAvatarText: { color: '#f5f0c0', fontWeight: 'bold', fontSize: 18 },
  resultName: { color: '#fff', fontWeight: 'bold', flex: 1 },
  matchedTag: { color: '#00e87a', fontSize: 12, fontWeight: 'bold' },
  wavedTag: { color: '#f5f0c0', fontSize: 12 },
  waveBtn: { borderWidth: 1, borderColor: '#f5f0c0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  waveBtnText: { color: '#f5f0c0', fontSize: 12, fontWeight: 'bold' },
  leaveBtn: { backgroundColor: '#12121f', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#333' },
  leaveBtnText: { color: '#888', fontWeight: 'bold' },
});