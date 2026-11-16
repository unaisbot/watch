INVASIVE WATCH KERALA – STAGE 1
================================

CONTENTS
- index.html: bilingual login and registration interface
- app.js: Firebase Authentication and volunteer profile logic
- firebase-config.js: your Firebase web configuration
- styles.css: responsive interface
- firestore.rules: initial Firestore security rules
- manifest.webmanifest: PWA metadata
- service-worker.js: basic app-shell caching (not full offline survey support)

IMPORTANT
1. This is Stage 1 only. Survey creation, quadrats, animal records, photo uploads,
   full offline data capture and admin approval tools are not implemented yet.
2. The first volunteer account is pending approval. Do not manually change a
   volunteer's approvalStatus from the browser.
3. Publish firestore.rules in Firebase Console before testing registration.
4. The app uses Firebase JS SDK 11.10.0 through Google's CDN.
5. Serve through GitHub Pages or a local web server. Do not open index.html
   directly as a file.
6. Firebase Storage is not used in this stage.

DEPLOYMENT
Copy the contents of the "survey" folder into the "survey" directory in your
Bioinvasion GitHub repository. The expected public URL is:
https://bioinvasion.in/survey/

FIRESTORE RULES
In Firebase Console:
Build > Firestore Database > Rules
Replace the existing rules with firestore.rules and click Publish.

AUTHENTICATION
Firebase Console > Authentication > Settings > Authorized domains
Ensure your GitHub Pages domain and custom domain are authorised:
- unaisbot.github.io (only if this is your actual GitHub Pages hostname)
- bioinvasion.in

Do not add domains you do not own or use.

API KEY
Restrict the Firebase API key to the website's HTTP referrers and the APIs
required by your Firebase application after deployment. Never publish service
account private keys or Admin SDK credentials.
