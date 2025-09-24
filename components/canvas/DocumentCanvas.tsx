// components/canvas/DocumentCanvas.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import RichTextEditor from './RichTextEditor';
import { FileText } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';


const DocumentCanvas = () => {
  const documents = useQuery(api.crud.document.getAll);
  const createDocument = useMutation(api.crud.document.create);
  const updateDocument = useMutation(api.crud.document.update);

  const [activeDocumentId, setActiveDocumentId] = useState<Id<'documents'> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-create a document if none exists
  useEffect(() => {
    if (isInitialized || !documents) return;

    const initializeDocument = async () => {
      if (documents.length === 0) {
        console.log('Creating new document...');
        const newDocId = await createDocument({
          sessionId: "SESSION_ID_PLACEHOLDER" as Id<"sessions">, // Replace with actual session ID
          title: 'Research Document',
          content: '<p>Start writing your research...</p>'
        });
        setActiveDocumentId(newDocId);
      } else {
        console.log('Using existing document:', documents[0]._id);
        setActiveDocumentId(documents[0]._id);
      }
      setIsInitialized(true);
    };

    initializeDocument();
  }, [documents, createDocument, isInitialized]);

  const handleContentUpdate = async (content: string) => {
    if (!activeDocumentId) return;

    try {
      await updateDocument({
        documentId: activeDocumentId,
        updates: { content }
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const activeDocument = documents?.find(doc => doc._id === activeDocumentId);

  if (!activeDocument) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-gray-500 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {documents === undefined ? 'Loading...' : 'Creating your research document...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <RichTextEditor
            value={activeDocument.content || '<p>Start writing your research...</p>'}
            onChange={handleContentUpdate}
            placeholder="Begin your research document..."
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentCanvas;