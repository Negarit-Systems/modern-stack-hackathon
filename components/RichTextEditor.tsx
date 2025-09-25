"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  BarChart3,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showGraphModal, setShowGraphModal] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = `<img src="${e.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`
        document.execCommand("insertHTML", false, img)
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML)
        }
      }
      reader.readAsDataURL(file)
    }
    setShowImageUpload(false)
  }

  const insertGraph = (type: string) => {
    let graphHtml = ""
    switch (type) {
      case "bar":
        graphHtml = `
          <div style="margin: 20px 0; padding: 20px; border: 2px dashed #e2e8f0; border-radius: 8px; text-align: center; background: #f8fafc;">
            <div style="display: flex; align-items: end; justify-content: center; gap: 10px; height: 100px; margin-bottom: 10px;">
              <div style="width: 30px; height: 60px; background: #3b82f6; border-radius: 4px;"></div>
              <div style="width: 30px; height: 80px; background: #10b981; border-radius: 4px;"></div>
              <div style="width: 30px; height: 40px; background: #f59e0b; border-radius: 4px;"></div>
              <div style="width: 30px; height: 70px; background: #ef4444; border-radius: 4px;"></div>
            </div>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Sample Bar Chart - Replace with actual data</p>
          </div>
        `
        break
      case "line":
        graphHtml = `
          <div style="margin: 20px 0; padding: 20px; border: 2px dashed #e2e8f0; border-radius: 8px; text-align: center; background: #f8fafc;">
            <svg width="200" height="100" style="margin-bottom: 10px;">
              <polyline points="20,80 60,40 100,60 140,20 180,50" stroke="#3b82f6" strokeWidth="3" fill="none"/>
              <circle cx="20" cy="80" r="4" fill="#3b82f6"/>
              <circle cx="60" cy="40" r="4" fill="#3b82f6"/>
              <circle cx="100" cy="60" r="4" fill="#3b82f6"/>
              <circle cx="140" cy="20" r="4" fill="#3b82f6"/>
              <circle cx="180" cy="50" r="4" fill="#3b82f6"/>
            </svg>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Sample Line Chart - Replace with actual data</p>
          </div>
        `
        break
      case "pie":
        graphHtml = `
          <div style="margin: 20px 0; padding: 20px; border: 2px dashed #e2e8f0; border-radius: 8px; text-align: center; background: #f8fafc;">
            <svg width="120" height="120" style="margin-bottom: 10px;">
              <circle cx="60" cy="60" r="50" fill="#3b82f6" stroke="#fff" strokeWidth="2"/>
              <path d="M 60,60 L 60,10 A 50,50 0 0,1 95,35 z" fill="#10b981" stroke="#fff" strokeWidth="2"/>
              <path d="M 60,60 L 95,35 A 50,50 0 0,1 85,95 z" fill="#f59e0b" stroke="#fff" strokeWidth="2"/>
            </svg>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Sample Pie Chart - Replace with actual data</p>
          </div>
        `
        break
    }

    document.execCommand("insertHTML", false, graphHtml)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    setShowGraphModal(false)
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="border-b border-border p-3 bg-muted/30">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 pr-3 border-r border-border">
            <button
              onClick={() => formatText("bold")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => formatText("italic")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => formatText("underline")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Underline"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 pr-3 border-r border-border">
            <button
              onClick={() => formatText("insertUnorderedList")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => formatText("insertOrderedList")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => formatText("formatBlock", "blockquote")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Quote"
            >
              <Quote size={16} />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 pr-3 border-r border-border">
            <button
              onClick={() => formatText("justifyLeft")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => formatText("justifyCenter")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => formatText("justifyRight")}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Media */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Insert Image"
            >
              <ImageIcon size={16} />
            </button>
            <button
              onClick={() => setShowGraphModal(true)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Insert Graph"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => {
                const url = prompt("Enter URL:")
                if (url) formatText("createLink", url)
              }}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Insert Link"
            >
              <Link size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="min-h-[500px] p-6 focus:outline-none prose prose-sm max-w-none"
          style={{
            lineHeight: "1.6",
            fontSize: "16px",
            direction: "ltr",
            textAlign: "left",
            unicodeBidi: "plaintext"
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder}
        />

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Graph Modal */}
      {showGraphModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Graph</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => insertGraph("bar")}
                className="p-4 border border-border rounded-lg hover:border-primary transition-colors text-center"
              >
                <BarChart3 size={24} className="mx-auto mb-2" />
                <span className="text-sm">Bar Chart</span>
              </button>
              <button
                onClick={() => insertGraph("line")}
                className="p-4 border border-border rounded-lg hover:border-primary transition-colors text-center"
              >
                <svg width="24" height="24" className="mx-auto mb-2">
                  <polyline points="2,20 8,10 14,15 22,5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                <span className="text-sm">Line Chart</span>
              </button>
              <button
                onClick={() => insertGraph("pie")}
                className="p-4 border border-border rounded-lg hover:border-primary transition-colors text-center"
              >
                <svg width="24" height="24" className="mx-auto mb-2">
                  <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3" />
                  <path d="M 12,12 L 12,2 A 10,10 0 0,1 18,6 z" fill="currentColor" />
                </svg>
                <span className="text-sm">Pie Chart</span>
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGraphModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
