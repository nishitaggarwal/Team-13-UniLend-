import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { firebase } from '../config';
import { useNavigation } from '@react-navigation/native';
import AnimatedCard from '../components/animatedCard';

const db = firebase.firestore();
const tagsList = ['maths', 'physics', 'ece', 'dsa', 'mechanics'];
const placeholderOptions = ['books', 'physics', 'ece', 'maths', 'notes'];
const screenWidth = Dimensions.get('window').width;
const SEARCH_BAR_MAX_WIDTH = 500;

const BrowseScreen = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [placeholder, setPlaceholder] = useState('Search books & notes...');
  const [activeTag, setActiveTag] = useState(null);
  const navigation = useNavigation();
  const currentUserEmail = firebase.auth().currentUser.email;

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      const random = placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
      setPlaceholder(`Search ${random}...`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const bookSnapshot = await db.collection('books').get();
      const noteSnapshot = await db.collection('notes').get();

      const books = bookSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: 'book',
      }));
      const notes = noteSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: 'note',
      }));
      const combined = [...books, ...notes].filter(
        (item) => item.uploaded_by?.toLowerCase() !== currentUserEmail.toLowerCase()
      );

      // Ensure tags and favourited_by are always arrays
      const cleaned = combined.map((item) => ({
        ...item,
        tags: Array.isArray(item.tags)
          ? item.tags.map((t) => t.toLowerCase())
          : [],
        favourited_by: Array.isArray(item.favourited_by)
          ? item.favourited_by
          : [],
      }));

      setAllItems(cleaned);
      setFilteredItems(cleaned);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  // --- Heart/favorite logic ---
  const handleToggleFavourite = async (item) => {
    const collection = item.type === 'book' ? 'books' : 'notes';
    const ref = db.collection(collection).doc(item.id);

  
    setFilteredItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              favourited_by: Array.isArray(i.favourited_by)
                ? i.favourited_by.includes(currentUserEmail)
                  ? i.favourited_by.filter((mail) => mail !== currentUserEmail)
                  : [...i.favourited_by, currentUserEmail]
                : [currentUserEmail],
            }
          : i
      )
    );

    try {
      const isFav =
        Array.isArray(item.favourited_by) &&
        item.favourited_by.includes(currentUserEmail);
      await ref.update({
        favourited_by: isFav
          ? firebase.firestore.FieldValue.arrayRemove(currentUserEmail)
          : firebase.firestore.FieldValue.arrayUnion(currentUserEmail),
      });
    } catch (e) {
      // fetchData();
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredItems(allItems);
      setActiveTag(null);
      return;
    }
    const filtered = allItems.filter((item) =>
      item.tags?.some((tag) => tag.startsWith(text.toLowerCase()))
    );
    setFilteredItems(filtered);
    setActiveTag(null);
  };

  const handleQuickTag = (tag) => {
    if (activeTag === tag) {
      setFilteredItems(allItems);
      setActiveTag(null);
    } else {
      const filtered = allItems.filter((item) =>
        item.tags?.includes(tag.toLowerCase())
      );
      setFilteredItems(filtered);
      setActiveTag(tag);
      setSearch('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemsList}>
      <AnimatedCard>
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProductDetail', { item })}
        >
          <View style={styles.itemImageContainer}>
            <Image
              source={{ uri: item.cover_image_url }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.itemDetails}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              {/* --- Heart Icon --- */}
              <TouchableOpacity
                onPress={() => handleToggleFavourite(item)}
                hitSlop={12}
                style={styles.heartBtn}
              >
                <Ionicons
                  name={
                    Array.isArray(item.favourited_by) &&
                    item.favourited_by.includes(currentUserEmail)
                      ? 'heart'
                      : 'heart-outline'
                  }
                  size={22}
                  color={
                    Array.isArray(item.favourited_by) &&
                    item.favourited_by.includes(currentUserEmail)
                      ? '#E6464D'
                      : '#222'
                  }
                  style={{
                    marginLeft: 9,
                  }}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemAuthor} numberOfLines={1}>
              Author: {item.author}
            </Text>
            <Text
              style={{
                color: item.book_status === 1 ? 'green' : 'red',
                fontWeight: 'bold',
                marginVertical: 5,
              }}
            >
              {item.book_status === 1 ? 'Available' : 'Not Available'}
            </Text>
            <View style={styles.itemFooter}>
              <View style={styles.conditionContainer}>
                <View
                  style={[styles.conditionDot, { backgroundColor: '#FFFD86' }]}
                />
                <Text style={styles.item_condition}>{item.condition}</Text>
              </View>
              <Text style={styles.owner} numberOfLines={1}>
                by {item.uploaded_by}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    </View>
  );

  const SEARCH_BAR_CONTAINER_STYLE = {
    width: Platform.OS === 'web'
      ? Math.min(screenWidth, SEARCH_BAR_MAX_WIDTH)
      : '100%',
    maxWidth: Platform.OS === 'web' ? SEARCH_BAR_MAX_WIDTH : '100%',
    alignSelf: Platform.OS === 'web' ? 'center' : 'auto',
    marginVertical: 8,
    paddingHorizontal: 0,
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#009387" barStyle="light-content" />

      {/* Custom Search Header */}
      <View style={[styles.searchBarContainer, SEARCH_BAR_CONTAINER_STYLE]}>
        <Ionicons name="search" size={22} color="#009387" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={text => {
            setSearch(text);
            handleSearch(text);
          }}
          returnKeyType="search"
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#bdbdbd" style={styles.clearIcon} />
          </Pressable>
        )}
      </View>

      {/* Quick Tag Panel */}
      <View style={styles.quickPanelContainer}>
        <FlatList
          data={tagsList}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: tag }) => (
            <TouchableOpacity
              style={[styles.quickButton, activeTag === tag && styles.activeButton]}
              onPress={() => handleQuickTag(tag)}
            >
              <Text
                style={[
                  styles.quickText,
                  activeTag === tag && styles.activeText,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Text style={{ color: '#888', fontSize: 16 }}>
              No items found.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 4,
    paddingHorizontal: 6,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f1f3f8',
    elevation: 3,
    shadowColor: '#101920',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginTop: 24,
    marginBottom: 12,
    height: 44,
    paddingLeft: 12,
    paddingRight: 6,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: Platform.OS === 'web' ? 10 : 6,
    backgroundColor: 'transparent',
    fontWeight: '500',
    borderWidth: 0,
  },
  clearIcon: {
    marginLeft: 4,
  },
  quickPanelContainer: {
    marginBottom: 6,
  },
  quickButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  activeButton: {
    backgroundColor: '#009387',
  },
  quickText: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsList: {
    marginBottom: 5,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    flexDirection: screenWidth < 700 ? 'column' : 'row',
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    width: '99%',
    alignSelf: 'center',
  },
  itemImageContainer: {
    width: screenWidth < 700 ? '100%' : 120,
    height: screenWidth < 700 ? screenWidth * 0.55 : 155,
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    gap: 7,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heartBtn: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
  },
  itemTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 10,
    lineHeight: 24,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  itemAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});

export default BrowseScreen;
