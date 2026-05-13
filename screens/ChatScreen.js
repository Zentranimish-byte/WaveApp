import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

export default function ChatScreen({ matchId, otherUserName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    fetchMessages(matchId);
  }
  async function fetchMessages(mid) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', mid)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');
    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: userId,
      content: content,
    });
    fetchMessages(matchId);
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerName}>{otherUserName || 'Chat'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.length === 0 && (
            <Text style={styles.emptyText}>Say hello! You matched.</Text>
          )}
          {messages.map(msg => (
            <View key={msg.id} style={[styles.bubble, msg.sender_id === userId ? styles.myBubble : styles.theirBubble]}>
              <Text style={[styles.bubbleText, msg.sender_id === userId ? styles.myBubbleText : styles.theirBubbleText]}>
                {msg.content}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  backBtn: { color: '#00ff88', fontSize: 16 },
  headerName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messageList: { flex: 1, padding: 16 },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myBubble: { backgroundColor: '#00ff88', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#1a1a2e', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15 },
  myBubbleText: { color: '#0a0a1a' },
  theirBubbleText: { color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#1a1a2e', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, backgroundColor: '#1a1a2e', color: '#fff', padding: 12, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#333', maxHeight: 100 },
  sendBtn: { backgroundColor: '#00ff88', padding: 12, borderRadius: 12, justifyContent: 'center' },
  sendBtnText: { color: '#0a0a1a', fontWeight: 'bold' },
});