
// cloudinary.js
import axios from 'axios';

// Replace with your actual credentials from Cloudinary dashboard
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/ds4kyxrbe/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'signed_preset';

export const cloudinaryUpload = async (fileUri, publicId) => {
  const formData = new FormData();

  // Extract file type
  const fileType = fileUri.split('.').pop();

  formData.append('file', {
    uri: fileUri,
    type: `image/${fileType}`,
    name: `${publicId}.${fileType}`,
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', publicId); 

  try {
    const res = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.secure_url;
  } catch (err) {
    console.error('Cloudinary Upload Error:', err.response?.data || err.message);
    throw err;
  }
};

