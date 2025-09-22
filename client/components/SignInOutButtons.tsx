import { useState } from "react";

export default function SignInOutButtons() {
  const [signedIn, setSignedIn] = useState(false);

  const handleSignIn = () => setSignedIn(true);
  const handleSignOut = () => setSignedIn(false);

  return (
    <div className="flex gap-2">
      {!signedIn ? (
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={handleSignIn}
        >
          Sign In
        </button>
      ) : (
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}
