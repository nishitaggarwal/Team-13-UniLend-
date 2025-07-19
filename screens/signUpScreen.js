import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Snackbar, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';

import { firebase } from '../config';

const db = firebase.firestore();

export default function SignUpScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sending, setSending] = useState(false);

  // Snackbar/state for UX
  const [snackbar, setSnackbar] = useState({ message: '', visible: false });

  // **Modern registration handler**
  const handleRegister = async () => {
    if (!firstName || !lastName || !branch || !emailId || !password || !confirmPassword) {
      setSnackbar({ message: 'Please fill all fields.', visible: true });
      return;
    }
    if (password !== confirmPassword) {
      setSnackbar({ message: 'Passwords do not match!', visible: true });
      return;
    }
    if (contact.length !== 10) {
      setSnackbar({ message: 'Enter a valid 10-digit contact number.', visible: true });
      return;
    }
    setSending(true);
    try {
      await firebase.auth().createUserWithEmailAndPassword(emailId, password);
      await db.collection('users').add({
        first_name: firstName,
        last_name: lastName,
        contact: contact,
        email_id: emailId.toLowerCase(),
        address: address,
        branch: branch,
        role: 'buyer',
        account_date: firebase.firestore.Timestamp.now(),
      });
      setSnackbar({ message: 'Registration Successful!', visible: true });
      setTimeout(() => navigation.navigate('SignInScreen'), 1200);
    } catch (error) {
      setSnackbar({ message: error.message, visible: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <LinearGradient
      colors={['#B1E5FB', '#72EDF2', '#FFDEE9']}  
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" backgroundColor="#B1E5FB" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.screenContent}>
            {/* Custom header */}
            <View style={styles.headerRow}>
              <Ionicons
                name="arrow-back"
                size={28}
                color="#333"
                style={{ marginRight: 8 }}
                onPress={() => navigation.navigate('SignInScreen')}
              />
              <Image
                style={styles.headerLogo}
                source={require('../assets/icon.png')}
              />
              <Text style={styles.headerTitle}>Registration</Text>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
            >
              <View style={styles.card}>
                <Image
                  source={require('../assets/cartoon-boy.png')}
                  style={{ width: 80, height: 68, alignSelf: 'center', marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text style={styles.bigTitle}>Sign Up</Text>
                {/* Inputs */}
                <TextInput
                  label="First Name"
                  value={firstName}
                  mode="outlined"
                  maxLength={20}
                  onChangeText={setFirstName}
                  style={styles.input}
                  left={<TextInput.Icon name="account" />}
                />

                <TextInput
                  label="Last Name"
                  value={lastName}
                  mode="outlined"
                  maxLength={20}
                  onChangeText={setLastName}
                  style={styles.input}
                  left={<TextInput.Icon name="account-outline" />}
                />

                <TextInput
                  label="Contact Number"
                  value={contact}
                  mode="outlined"
                  keyboardType="numeric"
                  maxLength={10}
                  onChangeText={setContact}
                  style={styles.input}
                  left={<TextInput.Icon name="cellphone" />}
                />

                <TextInput
                  label="Address"
                  value={address}
                  mode="outlined"
                  multiline
                  onChangeText={setAddress}
                  style={styles.input}
                  left={<TextInput.Icon name="map-marker" />}
                />

                <TextInput
                  label="Branch"
                  value={branch}
                  mode="outlined"
                  onChangeText={setBranch}
                  style={styles.input}
                  left={<TextInput.Icon name="school-outline" />}
                />

                <TextInput
                  label="Email"
                  value={emailId}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setEmailId}
                  style={styles.input}
                  left={<TextInput.Icon name="email-outline" />}
                />

                <TextInput
                  label="Password"
                  value={password}
                  mode="outlined"
                  secureTextEntry
                  onChangeText={setPassword}
                  style={styles.input}
                  left={<TextInput.Icon name="lock-outline" />}
                />

                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  mode="outlined"
                  secureTextEntry
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                  left={<TextInput.Icon name="lock-check-outline" />}
                />

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={sending}
                  disabled={sending}
                  style={styles.registerBtn}
                  labelStyle={styles.registerBtnLabel}
                  contentStyle={{ height: 48 }}
                  icon="account-plus"
                >
                  {sending ? "Registering..." : "Register"}
                </Button>
              </View>
            </ScrollView>

            <Snackbar
              visible={snackbar.visible}
              onDismiss={() => setSnackbar({ visible: false, message: '' })}
              style={{ backgroundColor: '#009387', borderRadius: 10 }}
              duration={2500}
            >
              {snackbar.message}
            </Snackbar>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 50 : 26,
    paddingHorizontal: 16,
    paddingBottom: 2,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
    gap: 7,
  },
  headerLogo: {
    width: 36,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#d8f1ff'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: "#222",
    flex: 1,
  },
  card: {
    width: "98%",
    minWidth: 330,
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 22,
    padding: 24,
    shadowColor: "#542",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 22,
    marginTop: 4,
  },
  bigTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 0,
    letterSpacing: 0.3,
  },
  input: {
    marginBottom: 13,
    fontSize: 16.5,
    backgroundColor: 'white',
  },
  registerBtn: {
    backgroundColor: "#009387",
    borderRadius: 13,
    marginTop: 19,
    elevation: 3,
  },
  registerBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: "white",
    letterSpacing: 0.6,
  },
});
