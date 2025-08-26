import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ScrollView, Image, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { firebase } from '../config';

import Animated, { FadeInDown } from 'react-native-reanimated'; // Correct named import

const db = firebase.firestore();
const screenWidth = Dimensions.get('window').width;

export default function EnquiriesScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    let unsubscribe;
    setLoading(true);

    unsubscribe = db.collection('books')
      .where('uploaded_by', '==', currentUser.email)
      .onSnapshot(async (snapshot) => {
        const items = [];
        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (Array.isArray(data.enquired_by) && data.enquired_by.length > 0) {
            const enqSnap = await db.collection('users')
              .where('email_id', 'in', data.enquired_by.slice(0, 10))
              .get();
            const enquirerDetails = enqSnap.docs.map(edoc => ({
              name: `${edoc.data().first_name || ''} ${edoc.data().last_name || ''}`.trim(),
              email: edoc.data().email_id,
            }));
            items.push({
              id: doc.id,
              ...data,
              enquirers: enquirerDetails,
            });
          }
        }
        setBooks(items);
        setLoading(false);
      });

    return () => unsubscribe && unsubscribe();
  }, []);

  const renderEnquirer = (enq, idx) => (
    <View key={idx} style={styles.enqRow}>
      <Ionicons name="person-circle" color="#7ad8d7" size={25} style={{ marginRight: 5 }} />
      <View>
        <Text style={styles.enqName}>{enq.name || '(No Name)'}</Text>
        <Text style={styles.enqEmail}>{enq.email}</Text>
      </View>
    </View>
  );

  const renderBookItem = ({ item, index }) => (
    // Use named import FadeInDown directly here!
    <Animated.View style={{ marginBottom: 16 }}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Image
            source={{ uri: item.cover_image_url || 'https://dummyimage.com/120x180/eee/aaa&text=No+Image' }}
            style={styles.bookImg}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.infoLine}>
              <Ionicons name="book-outline" size={14} color="#888" /> {item.author}
            </Text>
            <Text style={[styles.infoLine, { marginTop: 2 }]}>
              <Ionicons name="information-circle-outline" size={14} color="#71bf98" /> {item.condition}
            </Text>
            <Text style={styles.status}>
              <Ionicons
                name={item.book_status === 1 ? 'checkmark-circle' : 'close-circle'}
                color={item.book_status === 1 ? '#21D375' : '#E43F5A'}
                size={15}
              />
              {' '}
              {item.book_status === 1 ? 'Available' : 'Not Available'}
            </Text>
          </View>
        </View>
        <View style={styles.enqHeaderRow}>
          <Ionicons name="help-circle-outline" color="#009387" size={20} />
          <Text style={styles.enqHeaderText}>
            Enquiries ({item.enquirers.length}):
          </Text>
        </View>
        <View style={styles.enquirersBox}>
          {item.enquirers.map(renderEnquirer)}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.bg}>
      <ScrollView>
        <Text style={styles.mainTitle}>
          <Ionicons name="help-buoy" size={27} color="#009387" />
          {'  '}
          Enquiries on Your Books
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#009387" style={{ marginTop: 72 }} />
        ) : books.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Ionicons name="help-circle-outline" size={78} color="#a0dbe8" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyMsg}>No enquiries yet!</Text>
            <Text style={styles.emptySubMsg}>
              Books with active enquiries will appear here. Once users add an enquiry on your uploads, you’ll see them listed below each book.
            </Text>
          </View>
        ) : (
          <FlatList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingTop: 5, paddingBottom: 70 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#f2f6fc",
    paddingHorizontal: 10,
    paddingTop: 1,
  },
  mainTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginTop: Platform.OS === 'ios' ? 15 : 0,
    marginBottom: 25,
    letterSpacing: 0.15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 21,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#AEC6CF',
    shadowOpacity: 0.17,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
    alignSelf: 'center',
    width: '98%',
    maxWidth: 470,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 13,
  },
  bookImg: {
    width: 68,
    height: 98,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  infoLine: {
    fontSize: 13.1,
    color: '#444C5F',
    fontWeight: "500",
  },
  status: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 5,
    color: '#189a75',
    alignItems: "center"
  },
  enqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 3,
    gap: 9,
  },
  enqHeaderText: {
    fontWeight: '700',
    color: "#009387",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  enquirersBox: {
    backgroundColor: "#f7fdfa",
    borderRadius: 13,
    padding: 8,
    marginTop: 2,
  },
  enqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: "#e8fbfd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    elevation: 0.5,
  },
  enqName: {
    fontSize: 14.3,
    color: "#23233A",
    fontWeight: "700",
  },
  enqEmail: {
    fontSize: 12.2,
    color: "#29b6b7",
    marginLeft: 2,
  },
  emptyStateBox: {
    alignItems: "center",
    marginTop: 70,
    opacity: 0.76,
    paddingHorizontal: 26,
  },
  emptyMsg: {
    fontSize: 18,
    color: "#455A64",
    fontWeight: "700",
    marginTop: 12,
  },
  emptySubMsg: {
    fontSize: 14.2,
    color: "#7a7d89",
    marginTop: 8,
    textAlign: "center",
  },
});
