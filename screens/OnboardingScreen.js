import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../services/supabase';

export default function OnboardingScreen(props) {
  const userId = props.userId;
  const onComplete = props.onComplete;
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [tagline, setTagline] = useState('');
  const [hereFor, setHereFor] = useState('');
  const [currentlyInto, setCurrentlyInto] = useState('');

  async function saveProfile() {
    if (!displayName || !age || !gender || !tagline || !hereFor) {
      Alert.alert('Please fill in all fields');
      return;
    }
    try {
      const result = await supabase.from('profiles').insert({
        user_id: userId,
        display_name: displayName,
        age: parseInt(age),
        gender: gender,
        tagline: tagline,
        here_for: hereFor,
        currently_into: currentlyInto,
      });
      console.log('RESULT:', JSON.stringify(result));
    } catch(e) {
      console.log('CATCH ERROR:', e.message);
    }
    onComplete();
  }

  if (step === 1) return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Step 1 of 4</Text>
      <Text style={styles.title}>What is your name?</Text>
      <TextInput style={styles.input} placeholder="Display name" placeholderTextColor="#888" value={displayName} onChangeText={setDisplayName} />
      <TextInput style={styles.input} placeholder="Age" placeholderTextColor="#888" value={age} onChangeText={setAge} keyboardType="number-pad" />
      <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  if (step === 2) return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Step 2 of 4</Text>
      <Text style={styles.title}>Your gender?</Text>
      {['Man', 'Woman', 'Non-binary', 'Prefer not to say'].map(g => (
        <TouchableOpacity key={g} style={[styles.optionBtn, gender === g && styles.optionSelected]} onPress={() => setGender(g)}>
          <Text style={[styles.optionText, gender === g && styles.optionTextSelected]}>{g}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  if (step === 3) return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Step 3 of 4</Text>
      <Text style={styles.title}>Your tagline?</Text>
      <Text style={styles.subtitle}>Max 40 characters. Make it yours.</Text>
      <TextInput style={styles.input} placeholder="Call me Chucky" placeholderTextColor="#888" value={tagline} onChangeText={t => setTagline(t.slice(0, 40))} />
      <Text style={styles.charCount}>{tagline.length}/40</Text>
      <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  if (step === 4) return (
    <View style={styles.container}>
      <Text style={styles.stepText}>Step 4 of 4</Text>
      <Text style={styles.title}>Here for?</Text>
      {['Dating', 'Friendship', 'Just vibing'].map(h => (
        <TouchableOpacity key={h} style={[styles.optionBtn, hereFor === h && styles.optionSelected]} onPress={() => setHereFor(h)}>
          <Text style={[styles.optionText, hereFor === h && styles.optionTextSelected]}>{h}</Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.title2}>Currently into?</Text>
      <TextInput style={styles.input} placeholder="Rewatching The Office..." placeholderTextColor="#888" value={currentlyInto} onChangeText={setCurrentlyInto} />
      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Lets go</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', padding: 24, justifyContent: 'center' },
  stepText: { color: '#888', fontSize: 13, marginBottom: 8 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  title2: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16, marginTop: 24 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 16, marginTop: -16 },
  input: { backgroundColor: '#1a1a2e', color: '#fff', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  charCount: { color: '#888', textAlign: 'right', marginBottom: 24, marginTop: -8 },
  button: { backgroundColor: '#00ff88', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#0a0a1a', fontWeight: 'bold', fontSize: 16 },
  optionBtn: { borderWidth: 1, borderColor: '#333', padding: 16, borderRadius: 12, marginBottom: 12 },
  optionSelected: { borderColor: '#00ff88', backgroundColor: '#0a2a1a' },
  optionText: { color: '#888', fontSize: 16 },
  optionTextSelected: { color: '#00ff88', fontWeight: 'bold' },
});