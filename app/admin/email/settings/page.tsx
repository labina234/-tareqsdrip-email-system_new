import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import AdminEmailSettingsClient from './AdminEmailSettingsClient';

export default function Page() {
  return (
    <>
      <SignedIn>
        <AdminEmailSettingsClient />
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 text-white">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="text-xl mb-2">Sign in required</div>
            <div className="text-white/70 mb-6">
              Please sign in to view Admin Email Settings.
            </div>
            <SignInButton mode="modal">
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition text-white font-medium">
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
