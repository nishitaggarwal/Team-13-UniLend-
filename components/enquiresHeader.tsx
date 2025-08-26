import React from 'react';
import { View, Text, TouchableOpacity,Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';


const EnquiresHeader = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={{     backgroundColor: '#f2f6fc' }}>
    
        <LinearGradient
        colors={['#f2f6fc', '#f2f6fc']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        >
        <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <Menu size={24} color="black" />
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text style={styles.mainTitle}>
                        
                        Enquiries
                </Text>
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
  mainTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: '#1f2937',
      textAlign: 'left',
      marginTop: Platform.OS === 'ios' ? 34 : 13,
      marginBottom: 25,
      letterSpacing: 0.15,
    },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    paddingTop: Platform.OS === 'ios' ? 34 : 13,
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

export default EnquiresHeader;
