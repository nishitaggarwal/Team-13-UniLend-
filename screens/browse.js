import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { firebase } from '../config';
import { Searchbar } from 'react-native-paper';

const db = firebase.firestore();
// const currentUserEmail = firebase.auth().currentUser.email;

const tagsList = ['maths', 'physics', 'ece', 'dsa', 'chemistry', 'biology', 'mechanics'];
const placeholderOptions = ['books', 'physics', 'ece', 'maths', 'notes'];

const BrowseScreen = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [placeholder, setPlaceholder] = useState('Search books & notes...');
  const [activeTag, setActiveTag] = useState(null);

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

      const books = bookSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'book' }));
      const notes = noteSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'note' }));
      const currentUserEmail = firebase.auth().currentUser.email;

      const combined = [...books, ...notes].filter(
        (item) => item.uploaded_by.toLowerCase() !== currentUserEmail.toLowerCase()
      );

      // Normalize tags to lowercase
      const cleaned = combined.map((item) => ({
        ...item,
        tags: (item.tags || []).map((t) => t.toLowerCase()),
      }));

      setAllItems(cleaned);
      setFilteredItems(cleaned);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
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
      const filtered = allItems.filter((item) => item.tags?.includes(tag.toLowerCase()));
      setFilteredItems(filtered);
      setActiveTag(tag);
      setSearch('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>Type: {item.type}</Text>
      <Text style={styles.meta}>By: {item.uploaded_by}</Text>
      <Text numberOfLines={2}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#009387" barStyle="light-content" />
        <Searchbar
                placeholder={placeholder}
                onChangeText={handleSearch}
                value={search}
                style={styles.searchBar}
                inputStyle={{ fontSize: 16 }}
                iconColor="#009387"
        />


   

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPanel}>
        {tagsList.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.quickButton, activeTag === tag && styles.activeButton]}
            onPress={() => handleQuickTag(tag)}>
            <Text style={[styles.quickText, activeTag === tag && styles.activeText]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  searchBox: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  quickPanel: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  quickButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
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
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },

   searchBar: {
    marginTop: 30,
    marginBottom: 15,
    borderRadius: 15,
    //backgroundColor: '#f1f1f1',
  },
});

export default BrowseScreen;
