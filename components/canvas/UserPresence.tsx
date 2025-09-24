import React, { useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface UserPresenceProps {
  currentUserId: Id<"users">;
  sessionId: Id<"sessions">;
}

const UserPresence: React.FC<UserPresenceProps> = ({ currentUserId, sessionId }) => {
  const session = useQuery(api.crud.session.getOne, { id: sessionId });
  const updateCollaborators = useMutation(api.crud.session.update);

  useEffect(() => {
    if (!session) return;
    // Add current user to collaboratorIds if not present
    if (!session.collaboratorIds.includes(currentUserId)) {
      updateCollaborators({ id: sessionId, updates: { collaboratorIds: [...session.collaboratorIds, currentUserId] } });
    }
  }, [currentUserId, session, sessionId, updateCollaborators]);

  if (!session) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600">
        <span className="font-medium">You:</span> {currentUserId}
      </div>
      {session.collaboratorIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Collaborators:</span>
          <div className="flex gap-1">
            {session.collaboratorIds.map((id, index) => (
              <div
                key={id}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
              >
                {id}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPresence;