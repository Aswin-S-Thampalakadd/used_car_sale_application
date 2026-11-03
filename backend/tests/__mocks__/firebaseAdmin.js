export const verifyFirebaseIdToken = async () => ({
  uid: "test-uid",
  email: "test@example.com",
  email_verified: true,
  name: "Test User",
  picture: null,
  firebase: { sign_in_provider: "google.com" },
});
