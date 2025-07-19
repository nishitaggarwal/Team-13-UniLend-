import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet , Platform} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';


import Ionicons from 'react-native-vector-icons/Ionicons';



const SettingsHeader = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={{     backgroundColor: '#B1E5FB' }}>
    <LinearGradient
      colors={['#3CB39F', '#0F9A98']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
          <Menu size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerRow}>
            <Ionicons name="settings-outline" size={26} color="#009387" style={{ marginRight: 10 }} />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
      </View>
    </LinearGradient></View>
  );
};

const styles = StyleSheet.create({
  header: { 
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
   
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
    headerRow: {
      flexDirection: 'row',
      flex: 1,
      alignItems: 'flex-end',
      paddingTop: Platform.OS === 'ios' ? 50 : 26,
      paddingBottom: 12,
      //paddingHorizontal: 10,
      //backgroundColor: "#B1E5FB",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    //   shadowColor: "#b5e0e6",
    //   shadowRadius: 14,
    //   shadowOpacity: 0.10,
    //   shadowOffset: { width: 0, height: 7 },
    //   elevation: 5,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: "#1F2937",
      letterSpacing: 0.4,
    },
  menuButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 50 : 15,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
    marginTop:4
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SettingsHeader;
