📚 UniLend — Study Resource Sharing App
UniLend is a mobile application built using React Native (with Expo) and Firebase + Cloudinary, aimed at helping students lend, borrow, or sell study materials such as books and notes within their college network.



Tech Stack
- **Frontend**: React Native (with Expo)
- **Backend/Database**: Firebase Firestore & Firebase Auth
- **Navigation**: React Navigation (Drawer, Tabs, Stack)
- **Styling**: React Native StyleSheet


🚀 Features

✅ Authentication
  Secure user authentication (sign-up/login/logout) using Firebase Auth.

📤 Upload Books & Notes
  Users can upload book and note listings with details such as:
    Title, Subject, Semester, Price, Format (PDF/Physical)

Real-time image and PDF uploads to Cloudinary
Unique file naming via custom ID generation

🌐 Cloudinary Integration
Book photos and note files are stored on Cloudinary
Secure upload using an unsigned preset
Supports only image/jpeg, image/png, and application/pdf (notes)
Smooth upload feedback with ✅ tick UI

📄 My Uploads
Users can view all uploaded resources (books/notes)
Update the status of their content:
Sold → Permanently deletes the listing
Lent or Unavailable → Marks item as unavailable in the database


💡 Project Goal
To reduce study-related expenses and promote a circular economy among students by encouraging them to reuse and recycle their study materials.
