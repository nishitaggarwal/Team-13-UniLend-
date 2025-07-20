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

// Email validation utility
const validateEmail = (email) =>
  !!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

export default function SignUpScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  // Inputs and validation states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sending, setSending] = useState(false);

  // UI: error tracking for instant field feedback
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ message: '', visible: false });

  // ----- Error mappings for Firebase Auth codes -----
  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign up is not enabled.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet.';
      default:
        return null;
    }
  };

  // ----- Registration handler with smooth error handling -----
  const handleRegister = async () => {
    // Validate all fields
    let err = {};
    if (!firstName) err.firstName = true;
    if (!lastName) err.lastName = true;
    if (!branch) err.branch = true;
    if (!contact || contact.length !== 10) err.contact = true;
    if (!validateEmail(emailId)) err.emailId = true;
    if (!password) err.password = true;
    if (!confirmPassword) err.confirmPassword = true;
    if (password && confirmPassword && password !== confirmPassword) err.confirmPassword = true;

    setErrors(err);

    // Show feedback for first error
    if (Object.keys(err).length) {
      // More specific user feedback
      if (err.emailId)
        setSnackbar({ message: 'Please enter a valid email address.', visible: true });
      else if (err.contact)
        setSnackbar({ message: 'Contact number must be exactly 10 digits.', visible: true });
      else if (err.branch)
        setSnackbar({ message: 'Branch/Specialization cannot be empty.', visible: true });
      else if (err.confirmPassword)
        setSnackbar({ message: password !== confirmPassword ? 'Passwords do not match!' : 'Please fill Confirm Password.', visible: true });
      else
        setSnackbar({ message: 'Please fill all fields.', visible: true });
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
      setTimeout(() => navigation.navigate('SignInScreen'), 1300);
    } catch (error) {
      const friendly = getFriendlyErrorMessage(error.code) || error.message;
      setSnackbar({ message: friendly, visible: true });
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
                source={require('../icon.png')}
              />
              <Text style={styles.headerTitle}>Registration</Text>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 16 }}
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
                  onChangeText={txt => {
                    setFirstName(txt);
                    if (errors.firstName && txt) setErrors(e => ({ ...e, firstName: false }));
                  }}
                  style={[
                    styles.input,
                    errors.firstName && styles.inputError
                  ]}
                  left={<TextInput.Icon name="account" />}
                />

                <TextInput
                  label="Last Name"
                  value={lastName}
                  mode="outlined"
                  maxLength={20}
                  onChangeText={txt => {
                    setLastName(txt);
                    if (errors.lastName && txt) setErrors(e => ({ ...e, lastName: false }));
                  }}
                  style={[
                    styles.input,
                    errors.lastName && styles.inputError
                  ]}
                  left={<TextInput.Icon name="account-outline" />}
                />

                <TextInput
                  label="Contact Number"
                  value={contact}
                  mode="outlined"
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={txt => {
                    const val = txt.replace(/[^0-9]/g, "");
                    setContact(val);
                    if (errors.contact && val.length === 10) setErrors(e => ({ ...e, contact: false }));
                  }}
                  style={[
                    styles.input,
                    errors.contact && styles.inputError
                  ]}
                  left={<TextInput.Icon name="cellphone" />}
                  error={errors.contact}
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

                <View style={{ width: '100%' }}>
                  <TextInput
                    label="Branch"
                    value={branch}
                    mode="outlined"
                    onChangeText={txt => {
                      setBranch(txt);
                      if (errors.branch && txt) setErrors(e => ({ ...e, branch: false }));
                    }}
                    style={[
                      styles.input,
                      errors.branch && styles.inputError
                    ]}
                    left={<TextInput.Icon name="school-outline" />}
                    error={errors.branch}
                  />
                  {/* Mini helper below branch */}
                  <Text
                    style={{
                      fontSize: 12,
                      marginBottom: 6,
                      color: errors.branch ? "#e24141" : "#495A6B",
                      marginLeft: 7
                    }}
                  >
                    Kindly enter your branch or specialization
                  </Text>
                </View>

                <TextInput
                  label="Email"
                  value={emailId}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={txt => {
                    setEmailId(txt);
                    if (errors.emailId && validateEmail(txt)) setErrors(e => ({ ...e, emailId: false }));
                  }}
                  style={[
                    styles.input,
                    errors.emailId && styles.inputError
                  ]}
                  left={<TextInput.Icon name="email-outline" />}
                  error={errors.emailId}
                />

                <TextInput
                  label="Password"
                  value={password}
                  mode="outlined"
                  secureTextEntry
                  onChangeText={txt => {
                    setPassword(txt);
                    if (errors.password && txt) setErrors(e => ({ ...e, password: false }));
                  }}
                  style={[
                    styles.input,
                    errors.password && styles.inputError
                  ]}
                  left={<TextInput.Icon name="lock-outline" />}
                  error={errors.password}
                />

                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  mode="outlined"
                  secureTextEntry
                  onChangeText={txt => {
                    setConfirmPassword(txt);
                    if (errors.confirmPassword && txt === password) setErrors(e => ({ ...e, confirmPassword: false }));
                  }}
                  style={[
                    styles.input,
                    errors.confirmPassword && styles.inputError
                  ]}
                  left={<TextInput.Icon name="lock-check-outline" />}
                  error={errors.confirmPassword}
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
              style={{
                backgroundColor: "#ec505e",
                borderRadius: 9,
                marginBottom: 44,
                minWidth: "82%",
                alignSelf: 'center',
                paddingVertical: 6,
              }}
              duration={2400}
              action={{
                label: "OK",
                onPress: () => setSnackbar({ visible: false, message: '' })
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>{snackbar.message}</Text>
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
    marginTop: Platform.OS === 'ios' ? 15 : 10,
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
  inputError: {
    backgroundColor: "#fff8f4",
    borderColor: "#e24141",
    borderWidth: 1.5
  },
  registerBtn: {
    backgroundColor: "#009387",
    borderRadius: 13,
    marginTop: 13,
    elevation: 3,
  },
  registerBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: "white",
    letterSpacing: 0.6,
  },
});

