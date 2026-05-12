import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Error', error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) Alert.alert('Error', error.message);
      else Alert.alert('Success', 'Account created!');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Wave</Text>
      <Text style={styles.tagline}>meet the moment</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8, color: '#00ff88', fontWeight: 'bold' },
  tagline: { color: '#00ff88', textAlign: 'center', fontSize: 16, marginBottom: 48, fontStyle: 'italic' },
  form: { gap: 16 },
  input: { backgroundColor: '#1a1a2e', color: '#fff', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#00ff88', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#0a0a1a', fontWeight: 'bold', fontSize: 16 },
  switchText: { color: '#888', textAlign: 'center', fontSize: 14 },
});