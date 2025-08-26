import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Header, Icon } from 'react-native-elements';
import { firebase } from '../config';

const { width } = Dimensions.get('window');
const db = firebase.firestore();

const ProductDetail = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();
  const [showContact, setShowContact] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [loadingEnquire, setLoadingEnquire] = useState(false);

  const currentUser = firebase.auth().currentUser;
  const userEmail = currentUser.email;

  const images = item?.cover_image_url
    ? Array.isArray(item.cover_image_url)
      ? item.cover_image_url
      : [item.cover_image_url]
    : [];

  // --- Enquiry Button Handler ---
  const handleAddEnquiry = async () => {
    setLoadingEnquire(true);

    try {
      const collection = item.type === 'note' ? 'notes' : 'books';
      const docRef = db.collection(collection).doc(item.id);

      await docRef.update({
        enquired_by: firebase.firestore.FieldValue.arrayUnion(userEmail),
      });

      setEnquirySent(true);
      Alert.alert('Enquiry added!', 'Your interest has been sent to the uploader.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add your enquiry. Please try again.');
    } finally {
      setLoadingEnquire(false);
    }
  };

  // Check if user already enquired to disable button accordingly
  const alreadyEnquired = Array.isArray(item.enquired_by)
    ? item.enquired_by.includes(userEmail)
    : false;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#009387" barStyle="light-content" />
      <Header
        backgroundColor="#009387"
        leftComponent={
          <Icon name="arrow-back" color="#fff" onPress={() => navigation.goBack()} />
        }
        centerComponent={{
          text: '📚 Book Details',
          style: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
        }}
        containerStyle={{ borderBottomWidth: 0 }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        />

        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>₹{item.price}</Text>

          <Text
            style={[
              styles.status,
              { color: item.book_status === 1 ? 'green' : 'red' },
            ]}
          >
            {item.book_status === 1 ? 'Available' : 'Not Available'}
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.sectionHeader}>Description</Text>
            <Text style={styles.description}>
              {item.description || 'No description provided.'}
            </Text>

            <Text style={styles.sectionHeader}>Author</Text>
            <Text style={styles.meta}>{item.author || 'Unknown'}</Text>

            <Text style={styles.sectionHeader}>Condition</Text>
            <Text style={styles.meta}>{item.condition || 'Not specified'}</Text>

            <Text style={styles.sectionHeader}>Uploaded By</Text>
            <Text style={styles.meta}>{item.uploaded_by}</Text>
          </View>

      
          <TouchableOpacity
            style={[styles.enquireButton, (enquirySent || alreadyEnquired) && styles.enquireButtonSent]}
            activeOpacity={enquirySent || alreadyEnquired ? 1 : 0.85}
            onPress={enquirySent || alreadyEnquired ? null : handleAddEnquiry}
            disabled={enquirySent || alreadyEnquired || loadingEnquire}
          >
            <Ionicons
              name={enquirySent || alreadyEnquired ? "checkmark-circle-outline" : "help-circle-outline"}
              color="#fff"
              size={22}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.enquireButtonText}>
              {enquirySent || alreadyEnquired
                ? 'Enquiry Added'
                : loadingEnquire
                ? 'Adding...'
                : 'Add Enquiry'}
            </Text>
          </TouchableOpacity>

          {/* Styled Contact Details Button */}
          <TouchableOpacity
            style={styles.contactButton}
            activeOpacity={0.85}
            onPress={() => setShowContact((prev) => !prev)}
          >
            <Ionicons
              name="mail-outline"
              color="#fff"
              size={20}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.contactButtonText}>
              {showContact ? 'Hide Contact Details' : 'View Contact Details'}
            </Text>
          </TouchableOpacity>

          {/* Conditionally Render Contact Details */}
          {showContact && (
            <View style={styles.contactDetailsBox}>
              <Text style={styles.contactDetailLabel}>Uploader Username:</Text>
              <Text style={styles.contactDetailValue}>{item.uploader_username}</Text>
              <Text style={styles.contactDetailLabel}>Email:</Text>
              <Text style={styles.contactDetailValue}>{item.uploaded_by}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  image: {
    width: width,
    height: 280,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 6,
  },
  infoBox: {
    marginTop: 12,
  },
  sectionHeader: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 20,
  },
  meta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  enquireButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009387',
    marginTop: 28,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 20,
    alignSelf: 'center',
    shadowColor: '#009387',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 7,
    minWidth: 220,
  },
  enquireButtonSent: {
    backgroundColor: '#229954',
  },
  enquireButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4fd1c5',
    marginTop: 8,
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignSelf: 'center',
    shadowColor: '#49ceb1',
    shadowOpacity: 0.17,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
    minWidth: 230,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contactDetailsBox: {
    marginTop: 16,
    backgroundColor: '#f0fdfa',
    padding: 14,
    borderRadius: 10,
  },
  contactDetailLabel: {
    color: '#374151',
    fontWeight: '600',
    marginTop: 6,
    fontSize: 15,
  },
  contactDetailValue: {
    color: '#009387',
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 4,
  },
});

export default ProductDetail;
