const mockVerifyIdToken = async () => ({
  uid: "test-uid",
  email: "test@example.com",
  email_verified: true,
  name: "Test User",
  picture: null,
  firebase: { sign_in_provider: "google.com" },
});

const mockAuth = () => ({
  verifyIdToken: mockVerifyIdToken,
});

const getApps = () => [];

const initializeApp = () => ({});

const applicationDefault = () => ({});

const getAuth = mockAuth;

export {
  getApps,
  initializeApp,
  applicationDefault,
  getAuth,
  mockVerifyIdToken,
};

export default {
  getApps,
  initializeApp,
  applicationDefault,
  getAuth,
};
