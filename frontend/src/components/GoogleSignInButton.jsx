import React from "react";

const GoogleSignInButton = ({ onClick, disabled, label = "Continue with Google" }) => (
  <button
    type="button"
    className="al-google-submit"
    onClick={onClick}
    disabled={disabled}
  >
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.4Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.4A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.8 27.7a12 12 0 0 1 0-7.4v-5.4H5.9a20 20 0 0 0 0 18.2l6.9-5.4Z"
      />
      <path
        fill="#EA4335"
        d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6 29.5 4 24 4A20 20 0 0 0 5.9 14.9l6.9 5.4c1.6-4.7 6-8.2 11.2-8.2Z"
      />
    </svg>
    {label}
  </button>
);

export default GoogleSignInButton;
