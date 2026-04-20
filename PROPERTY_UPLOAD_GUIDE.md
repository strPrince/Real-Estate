# Property Upload Guide - Aadikara Avenue

This guide explains how to upload the Aadikara Avenue property with images to your Firebase project.

## 📋 Property Details

**Project:** Aadikara Avenue  
**Location:** Atladra, Vadodara  

### Unit Types

#### 2 BHK Apartments
- **Carpet Area:** 665 - 860 sq ft
- **Price:** ₹33.5 - 38 lacs

#### Shops
- **Carpet Area:** 197 - 261 sq ft
- **Price:** ₹35 - 48 lacs

## 📁 Images

Three images are provided in: `frontend/src/assets/temp/`
- `img1.jpeg`
- `img2.jpeg`
- `img3.jpeg`

## 🚀 Option 1: Backend Node.js Script

This is the **recommended method** if your backend is running.

### Prerequisites
- Backend dependencies installed
- `.env` file configured with Firebase credentials
- Backend server running or ready to run

### Steps

1. **Ensure Firebase is configured** in `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=your-project
   FIREBASE_PRIVATE_KEY=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_STORAGE_BUCKET=...
   ```

2. **Run the upload script:**
   ```bash
   # From project root directory
   cd backend
   node upload-aadikara-property.js
   ```

3. **Monitor the output:**
   - Script will upload 3 images to Firebase Storage
   - Property document will be created in Firestore
   - Success message with Document ID will appear

### Example Output
```
🚀 Starting property upload process...

============================================================
🖼️  Uploading images to Firebase Storage...
📤 Uploading: img1.jpeg
✅ Uploaded: img1.jpeg → https://storage.googleapis.com/...
📤 Uploading: img2.jpeg
✅ Uploaded: img2.jpeg → https://storage.googleapis.com/...
📤 Uploading: img3.jpeg
✅ Uploaded: img3.jpeg → https://storage.googleapis.com/...

============================================================
📝 Uploading property to Firestore...
✅ Property created successfully!
📄 Document ID: abc123def456

✨ Property upload completed successfully!
```

---

## 🌐 Option 2: Frontend Browser Script

Use this if backend is not available or database is client-side only.

### Prerequisites
- Frontend running (Vite dev server)
- Admin authentication already set up
- Firebase client SDK initialized

### Steps

1. **Navigate to your admin page** or open browser console (F12)

2. **Import and run the upload function:**
   ```javascript
   import { uploadAadikaraProperty } from '/src/utils/uploadProperty.js';
   import { db, storage } from '/src/firebase-config.js'; // Adjust path to your config

   uploadAadikaraProperty(db, storage).then(result => {
     console.log('Property uploaded:', result.propertyId);
   });
   ```

   Or add a button to your admin panel that calls this function.

3. **Monitor the output** in browser console

---

## 📊 Data Structure

### Firestore Document Structure
```javascript
{
  name: "Aadikara Avenue",
  locality: "Atladra",
  city: "Vadodara",
  type: "residential",
  intent: "buy",
  status: "active",
  featured: false,
  
  // Unit information
  units: [
    {
      type: "2 BHK",
      carpetArea: { min: 665, max: 860, unit: "sq ft" },
      price: { min: 3350000, max: 3800000, currency: "INR" }
    },
    {
      type: "Shops",
      carpetArea: { min: 197, max: 261, unit: "sq ft" },
      price: { min: 3500000, max: 4800000, currency: "INR" }
    }
  ],
  
  // Easy filtering fields
  bedrooms: 2,
  priceMin: 3350000,
  priceMax: 4800000,
  areaMin: 197,
  areaMax: 860,
  
  // Images
  imageUrls: [
    "https://storage.googleapis.com/...",
    "https://storage.googleapis.com/...",
    "https://storage.googleapis.com/..."
  ],
  
  amenities: ["Parking", "Security", "Water Supply", "Electricity"],
  createdAt: "2026-04-20T...",
  updatedAt: "2026-04-20T..."
}
```

---

## 🔍 Verify Upload

### In Firebase Console
1. Go to **Firestore Database** → Collections → **properties**
2. Look for document with `name: "Aadikara Avenue"`
3. Check **Storage** → `properties/` folder for uploaded images

### Query in Your App
```javascript
// Get the property
const q = query(
  collection(db, 'properties'),
  where('name', '==', 'Aadikara Avenue')
);
const snapshot = await getDocs(q);
```

---

## 🛠️ Troubleshooting

### ❌ "Image not found" error
- Verify images exist: `frontend/src/assets/temp/img1.jpeg`, `img2.jpeg`, `img3.jpeg`
- Check file permissions
- Ensure correct paths in script

### ❌ Firebase Authentication error
- Check `.env` file has all required credentials
- Verify Firebase project ID matches
- Ensure service account has Firestore & Storage permissions

### ❌ Storage permission denied
- Check Firebase Storage Rules allow write access
- Verify service account has storage.buckets.get permission

### ❌ Images not uploading
- Check image files are valid JPEG/PNG/WebP
- File size should be under 10 MB
- Check browser network tab for 403/401 errors

---

## 📝 Customization

To modify the property data, edit the `PROPERTY_DATA` object in:
- Backend: `backend/upload-aadikara-property.js`
- Frontend: `frontend/src/utils/uploadProperty.js`

### Change property details:
```javascript
PROPERTY_DATA = {
  name: 'Your Property Name',
  locality: 'Your Locality',
  description: 'Your description',
  // ... rest of properties
}
```

### Change image paths:
```javascript
// Backend
const IMAGE_FILES = ['your-image-1.jpg', 'your-image-2.jpg'];

// Frontend
const images = import.meta.glob('/src/assets/temp/*.jpeg'); // Adjust glob pattern
```

---

## 💡 Tips

- ✅ Backend script is recommended for production uploads
- ✅ Frontend script is good for testing/admin dashboard
- ✅ Both scripts include comprehensive logging
- ✅ Images are compressed automatically by Firebase
- ✅ Use clear, descriptive image names for easy identification
- ✅ Always verify uploads in Firebase Console before shipping

---

## 📞 Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review browser console for client-side errors
3. Check backend logs for server-side errors
4. Ensure all Firebase credentials are correctly set

Happy uploading! 🎉
