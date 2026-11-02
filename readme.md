project started
run npm install

## Firebase Google sign-in

Enable the Google provider in Firebase Authentication. Set the Firebase web
app values in the frontend environment as `REACT_APP_FIREBASE_API_KEY`,
`REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, and
`REACT_APP_FIREBASE_APP_ID`. Set `FIREBASE_PROJECT_ID` for the backend and
provide Firebase Admin credentials through Application Default Credentials
(for local development, `GOOGLE_APPLICATION_CREDENTIALS` can point to a
service-account JSON file kept outside version control).

Google sign-in creates customer accounts automatically. Dealer accounts must
be created from the dealer sign-up tab and include a dealership name. Existing
accounts can use Google only when their Firebase-verified email matches the
account's existing role.
