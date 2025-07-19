import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '.';
import TabNavigator from './tab-navigator';
import BookUploadsScreen from '../screens/UserUploadsScreen';
import UploadsCustomHeader from '../components/uploadsCustomHeader';
import SettingScreen from '../screens/SettingsScreen'; 
import SettingsHeader from '../components/settingsHeader'; 
import CustomDrawerContent from '../components/CustomDrawerContent'; // <-- NEW

import FavouritesScreen from '../screens/FavouritesScreen'; // <-- NEW
import FavouriteHeader from '../components/favouritesHeader'; // <-- NEW
// <-- NEW
type Props = StackScreenProps<RootStackParamList, 'DrawerNavigator'>;

type DrawerParamList = {
  Home: undefined;
  'User-Uploads': undefined;
  'SettingScreen': undefined;
  'FavouritesScreen': undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator({ navigation }: Props) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />} // <-- add this line
      screenOptions={{
        drawerActiveTintColor: "#009387",
        drawerInactiveTintColor: "#3b566e",
        drawerLabelStyle: { fontWeight: "600", fontSize: 15, marginLeft: -13 },
        drawerStyle: { borderTopRightRadius: 36, borderBottomRightRadius: 36, width: 260, backgroundColor: "#eaf5fc" }
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false,
          drawerLabel: "  Home",
        }}
      />
      <Drawer.Screen
        name="User-Uploads"
        component={BookUploadsScreen}
        options={{
          header: () => <UploadsCustomHeader />,
          headerShown: true,
          drawerLabel: "  My Uploads",
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="collections-bookmark" size={size} color={color} />
          ),
        }}
      />


      <Drawer.Screen
        name="FavouritesScreen"
        component={FavouritesScreen}
        options={{
          header: () => <FavouriteHeader />,
          headerShown: true,
          drawerLabel: "  Favourites",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="SettingScreen"
        component={SettingScreen}
        options={{
          header: () => <SettingsHeader />,
          headerShown: true,
          drawerLabel: "  Settings",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />







    </Drawer.Navigator>
  );
}
