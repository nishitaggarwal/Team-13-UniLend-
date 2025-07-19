import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Button, Text, TextInput, Snackbar, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';

import { firebase } from '../config';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const theme = useTheme();

  const forgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setSnackbarMsg("Please enter a valid email address.");
      setSnackbarVisible(true);
      return;
    }
    setSending(true);
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setSnackbarMsg("Password reset email sent!");
    } catch (error) {
      setSnackbarMsg(error.message || "Failed to send email.");
    } finally {
      setSnackbarVisible(true);
      setSending(false);
    }
  };

  return (
    <LinearGradient
      colors={['#B1E5FB', '#00E0F5', '#FFDEE9']}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" backgroundColor="#B1E5FB" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.screenContent}>
            {/* Custom Header */}
            <View style={styles.headerRow}>
              <Ionicons
                name="arrow-back"
                size={28}
                color="#333"
                style={{ marginRight: 8 }}
                onPress={() => navigation.goBack()}
              />
              <Image
                style={styles.headerLogo}
                source={require('../icon.png')}
              />
              <Text style={styles.headerTitle}>Reset Password</Text>
            </View>

            <View style={styles.card}>
              <Image
                source={require('../assets/cartoon-boy.png')}
                style={{ width: 96, height: 84, alignSelf: 'center', marginBottom: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.topTitle}>Forgot Password?</Text>
              <Text style={styles.infoText}>
                No worries! Enter your email below and we will send a
                password reset link.
              </Text>

              <TextInput
                label="Email Address"
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon name="email-outline" />}
                value={email}
                onChangeText={setEmail}
                disabled={sending}
                autoFocus
                error={!!email && !/\S+@\S+\.\S+/.test(email)}
                theme={{
                  colors: {
                    primary: "#009387", 
                    placeholder: "#789",
                    background: "white"
                  }
                }}
              />

              <Button
                mode="contained"
                onPress={forgotPassword}
                loading={sending}
                disabled={sending || !email}
                style={styles.sendButton}
                labelStyle={styles.sendButtonLabel}
                contentStyle={{ height: 50 }}
                icon="send"
              >
                Send Password Reset Email
              </Button>
            </View>

            <Button
              mode="text"
              icon="arrow-left"
              style={styles.backBtn}
              labelStyle={{ color: "#009387", fontSize: 15, fontWeight: '600' }}
              onPress={() => navigation.goBack()}
            >
              Back to Login
            </Button>

            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              style={{ backgroundColor: "#009387", borderRadius: 10 }}
              duration={2400}
            >
              {snackbarMsg}
            </Snackbar>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: Platform.OS === "ios" ? 24 : 8,
    gap: 8,
  },
  headerLogo: {
    width: 38, height: 36, marginRight: 8, borderRadius: 10, backgroundColor: '#d8f1ff'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: "#222",
    flex: 1,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#542",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 22,
    minHeight: 360,
  },
  topTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: "#1f2937",
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  infoText: {
    color: '#35718e',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  sendButton: {
    marginTop: 12,
    backgroundColor: "#009387",
    borderRadius: 11,
    elevation: 2,
  },
  sendButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: "white",
  },
  backBtn: {
    marginTop: 6,
    alignSelf: 'center',
    borderRadius: 12,
    width: "70%",
  }
});

export default ForgotPasswordScreen;
