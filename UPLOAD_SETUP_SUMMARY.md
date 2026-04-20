# 📦 Firebase Property Upload - Complete Setup

I've created a comprehensive solution to upload the **Aadikara Avenue property** with images to your Firebase project.

## 📂 Files Created

### 1. **Backend Upload Script** 
📄 `backend/upload-aadikara-property.js`
- Node.js script for server-side upload
- Automatically uploads images from `frontend/src/assets/temp/`
- Creates Firestore document with all property details
- Handles errors gracefully with detailed logging

### 2. **Frontend Upload Utility**
📄 `frontend/src/utils/uploadProperty.js`
- Client-side JS module for browser-based upload
- Can be integrated into admin dashboard
- Uses Firebase client SDK
- Exports reusable function

### 3. **Documentation**
📄 `PROPERTY_UPLOAD_GUIDE.md`
- Complete step-by-step guide
- Troubleshooting section
- Data structure reference
- Customization instructions

### 4. **Quick Start Scripts**
- 🐚 `upload-property.sh` - For Linux/Mac
- 🪟 `upload-property.bat` - For Windows

## 🚀 Quick Start

### Option A: Using NPM (Easiest)
```bash
# From project root directory
cd backend
npm run upload-aadikara
```

### Option B: Using Batch Script (Windows)
```bash
# From project root directory
.\upload-property.bat
```

### Option C: Using Shell Script (Linux/Mac)
```bash
# From project root directory
bash upload-property.sh
```

## 📊 Property Details Uploaded

**Project:** Aadikara Avenue  
**Location:** Atladra, Vadodara  

### Units Configuration
| Unit Type | Carpet Area | Price |
|-----------|------------|-------|
| 2 BHK | 665-860 sq ft | ₹33.5-38 lacs |
| Shops | 197-261 sq ft | ₹35-48 lacs |

### Images
All 3 images from `frontend/src/assets/temp/` will be uploaded:
- `img1.jpeg`
- `img2.jpeg`
- `img3.jpeg`

## 🔧 Firebase Configuration Status

✅ **Backend Firebase Config**: Configured in `backend/firebase.js`
- Uses environment variables from `.env`
- Supports both Firestore database and Cloud Storage
- Handles image uploads to Firebase Storage

✅ **Environment Variables**: Located in `backend/.env`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- Service account credentials

## 📋 Property Data Structure

The uploaded property follows this Firestore schema:

```javascript
{
  name: "Aadikara Avenue",
  locality: "Atladra",
  city: "Vadodara",
  description: "Premium residential and commercial project...",
  type: "residential",
  intent: "buy",
  status: "active",
  featured: false,
  
  units: [
    { type: "2 BHK", carpetArea: {...}, price: {...} },
    { type: "Shops", carpetArea: {...}, price: {...} }
  ],
  
  priceMin: 3350000,      // For filtering (in paise)
  priceMax: 4800000,
  areaMin: 197,
  areaMax: 860,
  bedrooms: 2,
  
  imageUrls: [            // Firebase Storage URLs
    "https://storage.googleapis.com/...",
    "https://storage.googleapis.com/...",
    "https://storage.googleapis.com/..."
  ],
  
  amenities: ["Parking", "Security", "Water Supply", "Electricity"],
  createdAt: "2026-04-20T...",
  updatedAt: "2026-04-20T..."
}
```

## ✅ Verification Checklist

Before running the upload script, ensure:

- [ ] Images exist in `frontend/src/assets/temp/` (img1.jpeg, img2.jpeg, img3.jpeg)
- [ ] Backend `.env` file is configured with Firebase credentials
- [ ] Firebase project is active and Firestore is enabled
- [ ] Firebase Storage bucket exists
- [ ] Node.js is installed and working
- [ ] Backend dependencies installed (`npm install` from backend folder)

## 🔍 After Upload

### Verify in Firebase Console
1. **Firestore Database**
   - Collections → properties
   - Look for document with name "Aadikara Avenue"

2. **Cloud Storage**
   - Browse storage files under `properties/` folder
   - Should see 3 image files

### Query from Your App
```javascript
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/path/to/firebase-config';

const q = query(
  collection(db, 'properties'),
  where('name', '==', 'Aadikara Avenue')
);
const snapshot = await getDocs(q);
const property = snapshot.docs[0].data();
```

## 🎯 Next Steps

1. **Review the property** in Firebase Console
2. **Test filtering** - Query by locality, price range, etc.
3. **Customize** other properties using the same script as template
4. **Integrate** frontend upload utility into admin dashboard
5. **Monitor** image displays on property detail page

## 📝 Customization Guide

### To upload different property:
Edit `backend/upload-aadikara-property.js` and modify `PROPERTY_DATA` object

### To use different images:
Update `IMAGE_FILES` array in the script

### To adjust property fields:
Modify the `PROPERTY_DATA` structure to match your needs

## 🆘 Troubleshooting

**Scripts not running?**
- Ensure Node.js is installed: `node --version`
- Install dependencies: `cd backend && npm install`
- Check Firebase `.env` credentials

**Images not uploading?**
- Verify image files exist in correct path
- Check Firebase Storage permissions
- Review browser/console for error details

**Property not appearing?**
- Check Firestore document was created
- Verify `status` field is set to `'active'`
- Check app's query filters aren't excluding it

For detailed troubleshooting, see `PROPERTY_UPLOAD_GUIDE.md`

---

## 📞 Summary

✅ Two working scripts provided (backend & frontend)  
✅ Complete documentation included  
✅ Ready-to-run with one command  
✅ Comprehensive error handling  
✅ Firebase best practices implemented  

**You're all set to upload properties to Firebase!** 🎉
