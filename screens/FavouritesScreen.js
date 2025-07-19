import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, StatusBar, Dimensions, ActivityIndicator, Platform, Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { firebase } from '../config';
import { useNavigation } from '@react-navigation/native';
import AnimatedCard from '../components/animatedCard';
import { LinearGradient } from 'expo-linear-gradient';

const db = firebase.firestore();
const screenWidth = Dimensions.get('window').width;

function FavouriteCard({ item, index, onUnfavourite, navigation }) {
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 420,
      delay: index * 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: slideAnim.interpolate({
          inputRange: [0, 30], outputRange: [1, 0.33]
        }),
        transform: [{ translateY: slideAnim }]
      }}
    >
      <View style={styles.itemsList}>
        <AnimatedCard>
          <TouchableOpacity
            style={styles.itemCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ProductDetail', { item })}
          >
            <View style={styles.itemImageContainer}>
              <Image
                source={{ uri: item.cover_image_url || 'https://dummyimage.com/120x180/c0c0c0/fff&text=No+Image' }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 7 }}>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                  {/* Heart for unfavourite */}
                  <TouchableOpacity
                    onPress={() => onUnfavourite(item)}
                    hitSlop={10}
                    style={styles.heartBtn}
                  >
                    <Ionicons
                      name="heart"
                      size={22}
                      color="#E6464D"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.itemAuthor} numberOfLines={1}>
                Author: {item.author ?? 'Unknown'}
              </Text>
              <Text style={{
                color: (item.book_status === 1 || item.note_status === 1) ? 'green' : 'red',
                fontWeight: 'bold',
                marginVertical: 5,
              }}>
                {(item.book_status === 1 || item.note_status === 1) ? 'Available' : 'Not Available'}
              </Text>
              <View style={styles.itemFooter}>
                <View style={styles.conditionContainer}>
                  <View style={[styles.conditionDot, { backgroundColor: '#FFFD86' }]} />
                  <Text style={styles.item_condition}>{item.condition}</Text>
                </View>
                <Text style={styles.owner} numberOfLines={1}>by {item.uploaded_by}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </AnimatedCard>
      </View>
    </Animated.View>
  );
}

export default function FavouritesScreen() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const userEmail = firebase.auth().currentUser.email;

  useEffect(() => {
    let unsubBooks, unsubNotes;
    setLoading(true);

    unsubBooks = db.collection('books')
      .where('favourited_by', 'array-contains', userEmail)
      .onSnapshot(snapshot => {
        const books = snapshot.docs.map(doc => ({
          id: doc.id, ...doc.data(), type: 'book',
        }));
        setFavourites(prev => [
          ...prev.filter(item => item.type !== 'book'), ...books
        ]);
        setLoading(false);
      });

    unsubNotes = db.collection('notes')
      .where('favourited_by', 'array-contains', userEmail)
      .onSnapshot(snapshot => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id, ...doc.data(), type: 'note',
        }));
        setFavourites(prev => [
          ...prev.filter(item => item.type !== 'note'), ...notes
        ]);
        setLoading(false);
      });

    return () => {
      unsubBooks && unsubBooks();
      unsubNotes && unsubNotes();
    };
  }, []);

  const handleUnfavourite = async (item) => {
    const collection = item.type === 'book' ? 'books' : 'notes';
    try {
      await db.collection(collection)
        .doc(item.id)
        .update({
          favourited_by: firebase.firestore.FieldValue.arrayRemove(userEmail),
        });
    } catch (e) {}
  };

  return (
    <LinearGradient
      colors={[ '#EEC9CF', '#F2C5C7']}
      style={{ flex: 1 }}
    >
      <StatusBar backgroundColor="#F2C5C7" barStyle="dark-content" />
   
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#E6464D" size="large" />
      ) : favourites.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={70} color="#b8b8b8" />
          <Text style={styles.emptyTextBig}>No Favourites Yet</Text>
          <Text style={styles.emptyTextSmall}>
            Tap the heart on any item to add it here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...favourites].sort((a, b) => (b.type === 'book' ? 1 : -1))}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) =>
            <FavouriteCard
              item={item}
              index={index}
              onUnfavourite={handleUnfavourite}
              navigation={navigation}
            />}
          contentContainerStyle={{ paddingBottom: 68, paddingTop: 5 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pageHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: Platform.OS === 'ios' ? 58 : 38,
    marginBottom: 14,
    gap: 4,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: 0.24,
    paddingLeft: 1,
  },
  itemsList: { marginBottom: 2 },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 19,
    flexDirection: screenWidth < 700 ? 'column' : 'row',
    margin: 8,
    borderWidth: 1.3,
    borderColor: '#EEC9CF',
    shadowColor: '#A98B9A',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 4,
    width: '99%',
    alignSelf: 'center',
  },
  itemImageContainer: {
    width: screenWidth < 700 ? '100%' : 120,
    height: screenWidth < 700 ? screenWidth * 0.5 : 155,
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 19,
    borderBottomLeftRadius: Platform.OS === 'web' || screenWidth < 700 ? 0 : 19,
  },
  itemImage: { width: '100%', height: '100%', borderRadius: 13 },
  itemDetails: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    gap: 7,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 7,
    gap: 5,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 10,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E6464D',
  },
  heartBtn: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
  },
  itemAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 1,
    letterSpacing: 0.1,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  item_condition: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  owner: {
    fontSize: 12,
    color: '#9CA3AF',
    maxWidth: 110,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 90,
    opacity: 0.75,
  },
  emptyTextBig: {
    fontSize: 19,
    color: '#444C5F',
    fontWeight: '800',
    marginTop: 18,
    letterSpacing: 0.15,
  },
  emptyTextSmall: {
    fontSize: 15,
    color: '#7a7d89',
    marginTop: 8,
    textAlign: 'center',
    marginHorizontal: 34,
    fontWeight: '500',
  }
});
