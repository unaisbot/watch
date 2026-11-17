INVASIVE WATCH KERALA – STAGE 1 + ADMIN DASHBOARD

This package is for the independent GitHub Pages application:
https://unaisbot.github.io/watch/

DEPLOYMENT
1. Extract this ZIP on your computer.
2. Open your GitHub repository named 'watch'.
3. Upload the CONTENTS of this folder to the repository root (not the folder itself).
4. Allow GitHub to replace the existing index.html, app.js and styles.css. The other files may also be uploaded; keep your existing Firebase config unchanged if it matches this project.
5. Commit the changes and wait for GitHub Pages to redeploy.

FIREBASE
- Project: invasive-watch-kerala
- Firebase Authentication: Email/Password
- Firestore collection: volunteers
- Keep the existing Firestore rules published. They allow users to read their own profile and administrators (admin custom claim) to review/update volunteer records.
- Do not make Firestore publicly readable.

ADMIN DASHBOARD
The dashboard checks the Firebase ID token custom claim 'admin: true'. The two administrator accounts were configured separately using Firebase Admin SDK. After deployment, each administrator should log out and log in again so the refreshed token includes the claim.

Admins can view volunteer profiles and set approvalStatus to 'approved' or 'rejected'. Administrator profiles are protected from volunteer approval/rejection actions.

SECURITY
- Never put Firebase service-account private keys in this repository.
- Do not assign admin privileges from browser-side code.
- Firebase web configuration is public client configuration; protect data with Authentication and Firestore Security Rules.

SCOPE
This is the administrator and volunteer-account foundation only. Plant/animal species management, field surveys, quadrat records, animal sampling, offline data capture and public dashboards will be developed in later stages.
