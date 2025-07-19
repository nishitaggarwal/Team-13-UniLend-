// components/CustomDrawerContent.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

type Props = any; // You can make this more strongly-typed for your nav

export default function CustomDrawerContent(props: Props) {
  // Optionally, get the user/email if you want to show info or avatar
  const user = firebase.auth().currentUser;

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      // Use navigation.reset to avoid stack "buildup" after logout
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'SplashScreen' }],
      });
    } catch (err) {
      alert('Error signing out: ' + (err.message || err));
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 0 : 36,
        backgroundColor: '#eaf5fc',
      }}
    >
      {/* Optional: Add a user avatar/header */}
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle-outline" size={58} color="#8fd3f4" />
        <Text style={styles.userName}>
          {user?.email || 'User'}
        </Text>
      </View>

      <View style={styles.drawerListWrap}>
        <DrawerItemList {...props} />
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Log Out Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" color="#fff" size={22} style={{ marginRight: 7 }} />
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  // Top user section (optional)
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    backgroundColor: '#b1e5fb',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 6,
    shadowColor: '#009387',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    elevation: 6,
    marginTop: 35,

  },
  userName: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: '700',
    color: '#178ca5',
    opacity: 0.8,
  },
  drawerListWrap: {
    flex: 0,
    marginTop: 8,
    marginLeft: 0,
    marginRight: 0,
  },
  // Logout button
  logoutBtn: {
    marginBottom: 20,
    backgroundColor: '#009387',
    borderRadius: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#009387',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },
  logoutBtnText: {
    fontWeight: '700',
    color: 'white',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
