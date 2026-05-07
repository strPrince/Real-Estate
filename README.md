# Property Master Vadodara

A modern real estate platform built with React, Firebase, and Node.js for buying, selling, and renting properties in Vadodara.

## 🚀 Features

- **Property Listings**: Browse, search, and filter properties by location, price, and type
- **User Authentication**: Secure login/signup with Firebase Auth
- **Property Upload**: Post properties with images, videos, and floor plans
- **Admin Dashboard**: Manage listings, users, and inquiries
- **Contact Forms**: Integrated inquiry system with email notifications
- **Responsive Design**: Mobile-first design with modern UI/UX

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Email**: Nodemailer with Gmail

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore and Storage enabled

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Production Deployment

For production deployment, copy the production environment template:

```bash
cp .env.production.example .env.production
# Edit .env.production with your production URLs
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_STORAGE_BUCKET=your-bucket

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
```

### Frontend (.env)

```env
VITE_APP_NAME=Property Master Vadodara
VITE_APP_TITLE=Property Master Vadodara - Find Your Dream Property
VITE_APP_DESCRIPTION=Discover top properties for sale and rent in Vadodara
VITE_DEFAULT_CITY=Vadodara
VITE_BRAND_EMAIL=your-email@gmail.com
VITE_BRAND_PHONE=+919876543210
VITE_BRAND_ADDRESS=Your Office Address

# API Configuration
VITE_BASE_URL=http://localhost:5000  # Backend API base URL (leave empty for same-domain requests in production)
VITE_API_PREFIX=/api                  # API prefix path
```

## 📁 Project Structure

```
├── backend/                 # Node.js Express server
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   └── firebase.js         # Firebase configuration
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── api.js         # API client functions
│   │   └── context/       # React context providers
│   └── public/            # Static assets
├── scripts/               # Utility scripts
└── firestore.indexes.json # Firestore indexes
```

## 📧 Contact

For support or inquiries:
- Email: propertymastervadodara@gmail.com
- Phone: +91 98242 52698
- Address: 303, 3rd Floor, Raj Avenue, Near Domino'z Pizza, Ellora Park, Vadodara 390023

## 📄 License

This project is private and proprietary.