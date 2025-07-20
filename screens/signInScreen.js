import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Platform, StyleSheet, StatusBar,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { firebase } from '../config';
import { Snackbar } from 'react-native-paper';

const getFriendlyErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is badly formatted.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No user exists with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/missing-password':
      return "Please enter your password.";
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/internal-error':
      return "Internal error. Please try again later.";
    default:
      return null;
  }
};

export default function SignInScreen({ navigation }) {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (message) =>
    setSnackbar({ visible: true, message });

  const userLogin = (email, pw) => {
    if (!email || !pw) {
      showError("Please enter both email and password.");
      return;
    }
    firebase.auth().signInWithEmailAndPassword(email, pw)
      .then(() => {
        navigation.navigate('DrawerNavigator');
      })
      .catch((error) => {
        const friendlyMsg =
          getFriendlyErrorMessage(error.code) ||
          error.message ||
          "Unknown error. Please try again.";
        showError(friendlyMsg);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#009387" barStyle="light-content" />
      <Animatable.View animation="bounceInUp" duration={500} style={styles.header}>
        <Text style={styles.text_header}>Welcome!</Text>
      </Animatable.View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <Text style={[styles.text_footer, { marginBottom: 2 }]}>Username</Text>
        <View style={styles.action}>
          <FontAwesome name="user-o" size={20} />
          <TextInput
            placeholder="Your Username"
            placeholderTextColor="#666666"
            style={styles.textInput}
            autoCapitalize="none"
            value={emailId}
            onChangeText={setEmailId}
          />
          {emailId.length > 1 ? (
            <Animatable.View animation="bounceIn">
              <Feather name="check-circle" color="green" size={20} />
            </Animatable.View>
          ) : null}
        </View>
        <Text style={[styles.text_footer, { marginTop: 30, marginBottom: 2 }]}>Password</Text>
        <View style={styles.action}>
          <Feather name="lock" size={20} />
          <TextInput
            placeholder="Your Password"
            placeholderTextColor="#666666"
            secureTextEntry={secureTextEntry}
            style={styles.textInput}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => userLogin(emailId, password)}
          />
          <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
            {secureTextEntry ? (
              <Feather name="eye-off" color="grey" size={20} />
            ) : (
              <Feather name="eye" color="grey" size={20} />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text style={{ color: '#009387', marginTop: 15 }}>Forgot password?</Text>
        </TouchableOpacity>
        <View style={styles.button}>
          <TouchableOpacity style={styles.signIn} onPress={() => userLogin(emailId, password)}>
            <LinearGradient colors={['#08d4c4', '#01ab9d']} style={styles.signIn}>
              <Text style={[styles.textSign, { color: '#fff' }]}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUpScreen')}
            style={[
              styles.signIn,
              { borderColor: '#009387', borderWidth: 1, marginTop: 15 }
            ]}>
            <Text style={[styles.textSign, { color: '#009387' }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* Professional Snackbar for errors */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        style={{
          backgroundColor: "#ec505e",
          borderRadius: 8,
          marginBottom: 34,
          minWidth: "80%",
          alignSelf: 'center',
        }}
        duration={1950}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbar({ visible: false, message: '' })
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          {snackbar.message}
        </Text>
      </Snackbar>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
    height: '100%',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  footer: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 3,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
