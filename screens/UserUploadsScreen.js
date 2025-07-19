import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
} from 'react-native';
import { firebase } from '../config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const statusOptions = [
  { value: 'sold', label: 'Sold', icon: 'check-decagram', color: '#E43F5A' },
  { value: 'lent', label: 'Lent', icon: 'book-open-variant', color: '#9966F6' },
  { value: 'available', label: 'Available', icon: 'check-circle', color: '#21D375' },
];

const BookUploadsScreen = () => {
  const [uploads, setUploads] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedStatusMap, setSelectedStatusMap] = useState({});
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const unsubscribeBooks = firebase
      .firestore()
      .collection('books')
      .where('uploaded_by', '==', currentUser.email)
      .onSnapshot((querySnapshot) => {
        const books = [];
        querySnapshot.forEach((doc) => {
          books.push({ id: doc.id, ...doc.data(), type: 'book' });
        });
        setUploads((prev) => [...prev.filter((item) => item.type !== 'book'), ...books]);
      });

    const unsubscribeNotes = firebase
      .firestore()
      .collection('notes')
      .where('uploaded_by', '==', currentUser.email)
      .onSnapshot((querySnapshot) => {
        const notes = [];
        querySnapshot.forEach((doc) => {
          notes.push({ id: doc.id, ...doc.data(), type: 'note' });
        });
        setUploads((prev) => [...prev.filter((item) => item.type !== 'note'), ...notes]);
      });

    return () => {
      unsubscribeBooks();
      unsubscribeNotes();
    };
  }, []);

  const handleToggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSelectStatus = (id, status) => {
    setSelectedStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleUpdateStatus = (item) => {
    const selectedStatus = selectedStatusMap[item.id];
    if (!selectedStatus) return;

    if (selectedStatus === 'sold') {
      Alert.alert(
        'Confirm Deletion',
        `If you mark this ${item.type} as sold, it will be deleted permanently. Are you sure?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: async () => {
              await firebase
                .firestore()
                .collection(item.type === 'book' ? 'books' : 'notes')
                .doc(item.id)
                .delete();
            },
          },
        ]
      );
    } else {
      const statusField = item.type === 'book' ? 'book_status' : 'note_status';
      const statusValue = selectedStatus === 'available' ? 1 : 0;
      firebase
        .firestore()
        .collection(item.type === 'book' ? 'books' : 'notes')
        .doc(item.id)
        .update({
          [statusField]: statusValue,
        });
    }
  };

  const emptyState = (
    <View style={styles.emptyContainer}>
      <Ionicons name="cloud-upload-outline" size={60} color="#BCD9FF" />
      <Text style={styles.emptyTitle}>No uploads yet</Text>
      <Text style={styles.emptyText}>
        All your uploaded books and notes will appear here.
      </Text>
    </View>
  );

  const renderStatusPill = (statusValue) => (
    <View style={[
      styles.statusPill,
      {
        backgroundColor: statusValue === 1 ? '#EAFBF1' : '#FFE8E5',
        borderColor: statusValue === 1 ? '#21D375' : '#E43F5A',
      }
    ]}>
      <Ionicons
        name={statusValue === 1 ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={statusValue === 1 ? '#21D375' : '#E43F5A'}
        style={{ marginRight: 5 }}
      />
      <Text style={{
        color: statusValue === 1 ? '#218157' : '#E43F5A',
        fontWeight: '700',
        fontSize: 14
      }}>{statusValue === 1 ? 'Available' : 'Unavailable'}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const selectedStatus = selectedStatusMap[item.id];
    const isExpanded = expandedId === item.id;
    const statusValue = item.type === 'book' ? item.book_status : item.note_status;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleToggleExpand(item.id)}
        activeOpacity={0.93}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <Ionicons
            name={item.type === 'book' ? "book-outline" : "document-text-outline"}
            size={22}
            color="#59C6F2"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>by {item.author}</Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6
        }}>
          {renderStatusPill(statusValue)}
          <View style={{ flex: 1 }} />
          <Ionicons
            name={isExpanded ? "chevron-up-circle-outline" : "chevron-down-circle-outline"}
            size={22}
            color="#B1B7C7"
          />
        </View>

        {isExpanded && (
          <View style={styles.actionsContainer}>
            <Text style={styles.editStatusLabel}>Change Status</Text>
            <View style={styles.segmentedRow}>
              {statusOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionButton,
                    selectedStatus === opt.value && { backgroundColor: opt.color + "22" },
                  ]}
                  onPress={() => handleSelectStatus(item.id, opt.value)}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={19}
                    color={selectedStatus === opt.value ? opt.color : "#B1B7C7"}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[
                    styles.optionText,
                    selectedStatus === opt.value && { color: opt.color, fontWeight: 'bold' }
                  ]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => handleUpdateStatus(item)}
              activeOpacity={0.89}
            >
              <Text style={styles.updateButtonText}>Update Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bgWrap}>
      <View style={styles.topGradient} />
      <FlatList
        data={uploads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 18, paddingTop: 38, paddingBottom: 90 }}
        ListEmptyComponent={emptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bgWrap: {
    flex: 1,
    backgroundColor: '#F2F6FC',
  },
  topGradient: {
    position: 'absolute',
    top: -80,
    left: -60,
    right: -60,
    height: 210,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    backgroundColor: '#B1E5FB',
    opacity: 0.45,
    zIndex: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#AEC6CF',
    shadowOpacity: 0.17,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 7,
    zIndex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#21223A',
    flex: 1,
  },
  meta: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 1,
    marginLeft: 30,
    marginTop: -8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 92,
    alignSelf: 'flex-start',
    marginRight: 6,
  },
  actionsContainer: {
    marginTop: 19,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#E4E9EF"
  },
  segmentedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#ECF6FB',
    marginHorizontal: 2,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    borderColor: "#E4E9EF",
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    color: '#455A64',
    fontWeight: '500',
  },
  editStatusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: "#8893AF",
    marginBottom: 6,
    marginLeft: 2,
  },
  updateButton: {
    backgroundColor: '#009387',
    marginTop: 18,
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#009387',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16.5,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 90,
    opacity: 0.78
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#455A64",
    marginTop: 25
  },
  emptyText: {
    fontSize: 14,
    color: "#8592A7",
    marginTop: 6,
    marginHorizontal: 20,
    textAlign: "center"
  }
});

export default BookUploadsScreen;
