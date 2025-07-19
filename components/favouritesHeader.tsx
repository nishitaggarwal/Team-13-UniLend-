import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

const FavouriteHeader = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
        <View style={{     backgroundColor: '#F2C5C7' }}>
    
    <LinearGradient
      colors={['#E97A80', '#F5A6B3']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
          <Menu size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.greeting}>My Favourites</Text>
        </View>
      </View>
    </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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

export default FavouriteHeader;
