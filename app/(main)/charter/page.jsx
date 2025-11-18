import { Suspense } from 'react';
import CharterPageContent from './CharterPageContent';

function CharterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  );
}

export default function CharterPage() {
  return (
    <Suspense fallback={<CharterLoading />}>
      <CharterPageContent />
    </Suspense>
  );
}