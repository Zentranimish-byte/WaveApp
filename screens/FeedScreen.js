import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [city, setCity] = useState('Delhi');

  useEffect(() => {
    setup();
  }, []);

  async function setup() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    fetchPosts();
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('hook_count', { ascending: false });
    console.log('posts:', data, error);
    setPosts(data || []);
  }

  async function submitPost() {
    if (!newPost.trim()) return;
    await supabase.from('posts').insert({
      user_id: userId,
      content: newPost.trim(),
      city: city,
    });
    setNewPost('');
    setShowPostModal(false);
    fetchPosts();
  }

  async function hookPost(post) {
    const { error } = await supabase.from('hooks').insert({
      post_id: post.id,
      user_id: userId,
    });
    if (error) {
      Alert.alert('Already hooked!');
      return;
    }
    await supabase.from('posts').update({
      hook_count: post.hook_count + 1
    }).eq('id', post.id);
    fetchPosts();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Feed</Text>
        <TouchableOpacity style={styles.postBtn} onPress={() => setShowPostModal(true)}>
          <Text style={styles.postBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.feed}>
        {posts.length === 0 && <Text style={styles.emptyText}>No posts yet. Be the first!</Text>}
        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <Text style={styles.postAuthor}>anonymous</Text>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.postFooter}>
              <Text style={styles.cityTag}>{post.city}</Text>
              <TouchableOpacity style={styles.hookBtn} onPress={() => hookPost(post)}>
                <Text style={styles.hookBtnText}>hook {post.hook_count}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showPostModal} transparent animationType="slide">
  <KeyboardAvoidingView 
    style={styles.modalOverlay} 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>What's on your mind?</Text>
      <TextInput
        style={styles.postInput}
        placeholder="Write something..."
        placeholderTextColor="#888"
        value={newPost}
        onChangeText={t => setNewPost(t.slice(0, 280))}
        multiline
        maxLength={280}
      />
      <Text style={styles.charCount}>{newPost.length}/280</Text>
      <TouchableOpacity style={styles.submitBtn} onPress={submitPost}>
        <Text style={styles.submitBtnText}>Post</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPostModal(false)}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
</Modal>
</View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  postBtn: { backgroundColor: '#00ff88', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  postBtnText: { color: '#0a0a1a', fontWeight: 'bold' },
  feed: { padding: 16 },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 40, fontSize: 14 },
  postCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 16 },
  postAuthor: { color: '#888', fontSize: 12, marginBottom: 8 },
  postContent: { color: '#fff', fontSize: 16, lineHeight: 24, marginBottom: 12 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cityTag: { color: '#555', fontSize: 12 },
  hookBtn: { backgroundColor: '#0a0a1a', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#00ff88' },
  hookBtnText: { color: '#00ff88', fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0a0a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1a1a2e' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  postInput: { backgroundColor: '#1a1a2e', color: '#fff', padding: 16, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#333', minHeight: 100, textAlignVertical: 'top', marginBottom: 8 },
  charCount: { color: '#888', textAlign: 'right', marginBottom: 16, fontSize: 12 },
  submitBtn: { backgroundColor: '#00ff88', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  submitBtnText: { color: '#0a0a1a', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 14 },
});