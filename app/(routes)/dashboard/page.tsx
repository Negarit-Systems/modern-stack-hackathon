'use client';

import React, { useState, useEffect } from 'react';
import UserPresence from '@/components/canvas/UserPresence';
import DocumentCanvas from '@/components/canvas/DocumentCanvas';
import { Id } from '@/convex/_generated/dataModel';

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null);
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);

  useEffect(() => {
    // Generate a random user ID for demo purposes
    setCurrentUserId("k579nhtt9c7fqvx5fqn4fdmea97r782x" as Id<"users">);
    setSessionId("kd7drve6ye17f2pqkpycfk2pns7r61xz" as Id<"sessions">);
  }, []);

  if (!currentUserId || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">AI Research Copilot</h1>
        <UserPresence currentUserId={currentUserId} sessionId={sessionId} />
      </header>

      <main className="flex-1 overflow-auto p-6">
        <DocumentCanvas />
      </main>
    </div>
  );
}