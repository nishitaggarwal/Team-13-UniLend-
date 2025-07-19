import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { firebase } from '../config';

function formatDate(timestamp) {
  try {
    if (!timestamp) return 'N/A';
    // Firestore Timestamp or JS Date
    let dateObj = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return String(timestamp);
  }
}

export default class SettingScreen extends Component {
  constructor() {
    super();
    this.state = {
      emailId: '',
      firstName: '',
      lastName: '',
      address: '',
      contact: '',
      branch: '',
      docId: '',
      accountDate: null,
      editMode: false,
    };
  }

  getUserDetails = () => {
    const email = firebase.auth().currentUser.email;
    firebase
      .firestore()
      .collection('users')
      .where('email_id', '==', email)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          this.setState({
            emailId: data.email_id,
            firstName: data.first_name,
            lastName: data.last_name,
            address: data.address,
            contact: data.contact,
            branch: data.branch,
            docId: doc.id,
            accountDate: data.account_date, // Firestore Timestamp
          });
        });
      });
  };

  updateUserDetails = () => {
    firebase
      .firestore()
      .collection('users')
      .doc(this.state.docId)
      .update({
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        address: this.state.address,
        contact: this.state.contact,
        branch: this.state.branch,
      })
      .then(() => {
        this.setState({ editMode: false });
        Alert.alert('✅ Profile Updated Successfully');
      })
      .catch((error) => {
        Alert.alert('❌ Error updating profile:', error.message);
      });
  };

  componentDidMount() {
    this.getUserDetails();
  }

  render() {
    const { editMode } = this.state;
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#B1E5FB" />
        <View style={styles.bgGradient}>
          {/* Soft glassy header */}
          

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.card}>
                <Image
                  source={require('../icon.png')}
                  style={styles.profileIcon}
                  resizeMode="cover"
                />
                <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Text style={styles.cardTitle}>Profile</Text>


                    <TouchableOpacity
                        onPress={() => {
                            if (editMode) {
                            this.getUserDetails(); // revert changes
                            }
                            this.setState({ editMode: !editMode });
                        }}
                        style={styles.editButton}
                        activeOpacity={0.90}
                        >
                        <Ionicons name={editMode ? "close" : "pencil"} size={22} color="#009387" />
                        <Text style={styles.editBtnText}>{editMode ? "Cancel" : "Edit"}</Text>
                    </TouchableOpacity>

                </View>



                <LabelRow label="First Name">
                  <EditableField
                    value={this.state.firstName}
                    onChangeText={text => this.setState({ firstName: text })}
                    editable={editMode}
                  />
                </LabelRow>
                <LabelRow label="Last Name">
                  <EditableField
                    value={this.state.lastName}
                    onChangeText={text => this.setState({ lastName: text })}
                    editable={editMode}
                  />
                </LabelRow>
                <LabelRow label="Contact">
                  <EditableField
                    value={this.state.contact}
                    onChangeText={text => this.setState({ contact: text.replace(/[^0-9]/g, '') })}
                    editable={editMode}
                    keyboardType="number-pad"
                  />
                </LabelRow>
                <LabelRow label="Branch">
                  <EditableField
                    value={this.state.branch}
                    onChangeText={text => this.setState({ branch: text })}
                    editable={editMode}
                  />
                </LabelRow>
                <LabelRow label="Address">
                  <EditableField
                    value={this.state.address}
                    onChangeText={text => this.setState({ address: text })}
                    editable={editMode}
                    multiline
                  />
                </LabelRow>

                {/* Read-only fields */}
                <LabelRow label="Email" noGutter>
                  <Text style={styles.readonlyField}>{this.state.emailId}</Text>
                </LabelRow>
                <LabelRow label="Account Created" noGutter>
                  <Text style={styles.readonlyField}>{formatDate(this.state.accountDate)}</Text>
                </LabelRow>

                {/* Update button only shown in editMode */}
                {editMode && (
                  <TouchableOpacity
                    style={styles.updateBtn}
                    onPress={this.updateUserDetails}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="save-outline" color="#fff" size={20} style={{ marginRight: 7 }} />
                    <Text style={styles.updateBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaProvider>
    );
  }
}

// --- Helper Components ---
function LabelRow({ label, children, noGutter }) {
  return (
    <View style={[styles.labelRow, noGutter && { marginBottom: 7 }]}>
      <Text style={styles.labelText}>{label}</Text>
      {children}
    </View>
  );
}
function EditableField(props) {
  return (
    <TextInput
      style={[
        styles.input,
        !props.editable && styles.disabledInput,
        props.multiline && { height: 52, textAlignVertical: 'top' },
      ]}
      placeholderTextColor="#8aa"
      underlineColorAndroid="transparent"
      selectionColor="#009387"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  bgGradient: {
    flex: 1,
    backgroundColor: '#B1E5FB'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 18,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: "#B1E5FB",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#b5e0e6",
    shadowRadius: 14,
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: "#1F2937",
    letterSpacing: 0.4,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#def9f1',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 6,
    marginLeft: 18,
  },
  editBtnText: {
    color: "#009387",
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  scrollContent: {
    minHeight: 640,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginTop: 26,
    width: '94%',
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: "#64dae1",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 22,
    elevation: 7,
    alignSelf: "center",
    alignItems: "stretch"
  },
  cardTitle: {
    fontSize: 21,
    color: "#009387",
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center'
  },
  profileIcon: {
    width: 59,
    height: 59,
    borderRadius: 18,
    marginTop: -38,
    marginBottom: 4,
    backgroundColor: "#def6f8",
    alignSelf: "center"
  },
  labelRow: {
    marginBottom: 15,
  },
  labelText: {
    color: "#627088",
    fontWeight: "600",
    fontSize: 14.5,
    marginBottom: 3,
    marginLeft: 3,
  },
  input: {
    width: "100%",
    paddingVertical: 9,
    paddingHorizontal: 9,
    fontSize: 16,
    borderRadius: 10,
    color: "#21223A",
    backgroundColor: "#f9feff",
    borderColor: "#bdeeed",
    borderWidth: 1,
    marginBottom: 1,
  },
  disabledInput: {
    backgroundColor: '#f0f0f5',
    color: '#9c9caa',
    borderColor: '#e0e4ea',
  },
  readonlyField: {
    fontSize: 15,
    color: "#7b899d",
    fontWeight: "500",
    paddingVertical: 6,
    paddingLeft: 1
  },
  updateBtn: {
    marginTop: 24,
    backgroundColor: "#009387",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    borderRadius: 15,
    paddingVertical: 14,
    shadowColor: '#009387',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
    alignSelf: "center"
  },
  updateBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  }
});
