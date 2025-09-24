"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Edit3, Users } from "lucide-react"

interface Note {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  timestamp: Date
  isEditing?: boolean
}

interface NotesEditorProps {
  notes: Note[]
  onSaveNote: (content: string) => void
  onUpdateNote: (id: string, content: string) => void
  currentUser: { name: string; avatar?: string }
}

export function NotesEditor({ notes, onSaveNote, onUpdateNote, currentUser }: NotesEditorProps) {
  const [newNote, setNewNote] = useState("")
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNewNote = async () => {
    if (!newNote.trim()) return

    setIsSaving(true)
    try {
      await onSaveNote(newNote)
      setNewNote("")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNotes((prev) => ({
      ...prev,
      [note.id]: note.content,
    }))
  }

  const handleSaveEdit = async (noteId: string) => {
    const content = editingNotes[noteId]
    if (!content?.trim()) return

    try {
      await onUpdateNote(noteId, content)
      setEditingNotes((prev) => {
        const updated = { ...prev }
        delete updated[noteId]
        return updated
      })
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }

  const handleCancelEdit = (noteId: string) => {
    setEditingNotes((prev) => {
      const updated = { ...prev }
      delete updated[noteId]
      return updated
    })
  }

  return (
    <div className="space-y-6">
      {/* New Note Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Add Research Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add your insights, observations, or questions about the research..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSaveNewNote} disabled={!newNote.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Note
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Edit3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notes yet. Start adding your research insights above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="group">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {note.author.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{note.author.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {note.timestamp.toLocaleString()}
                      </Badge>
                    </div>
                    {note.author.name === currentUser.name && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {editingNotes[note.id] !== undefined ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editingNotes[note.id]}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            [note.id]: e.target.value,
                          }))
                        }
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(note.id)}>
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancelEdit(note.id)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
