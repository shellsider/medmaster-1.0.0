// src/server/firebase-admin.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Log that this file is being loaded
console.log('firebase-admin.js is being loaded');

const serviceAccountPath = './firebase_config.json'
console.log('Service account path:', serviceAccountPath);

let serviceAccount;
try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('Loaded service account:', serviceAccount);
} catch (err) {
    console.error('Error loading service account JSON:', err);
    throw err;
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export default admin;
