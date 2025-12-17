import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import CampaignDetailsClient from './CampaignDetailsClient';

export default function CampaignDetailsPage() {
  return (
    <>
      <SignedIn>
        <CampaignDetailsClient />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center p-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">Admin Access Required</h1>
            <p className="text-white/60 mb-8">
              Please sign in to view campaign details.
            </p>
            <SignInButton mode="modal">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
