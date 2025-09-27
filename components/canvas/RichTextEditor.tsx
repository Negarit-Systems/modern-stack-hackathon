"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [showGraphModal, setShowGraphModal] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);
  const lastValueRef = useRef<string>(value);

  // Save & restore cursor
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreCursorPosition = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Only sync external changes into editor if truly different
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        const range = saveCursorPosition();
        editorRef.current.innerHTML = value;
        lastValueRef.current = value;
        restoreCursorPosition(range);
      }
    }
  }, [value]);

  const formatText = (command: string, val?: string) => {
    isUpdatingRef.current = true;
    document.execCommand(command, false, val);
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      lastValueRef.current = newValue;
      onChange(newValue);
    }
    isUpdatingRef.current = false;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = `<img src="${e.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
        isUpdatingRef.current = true;
        document.execCommand("insertHTML", false, img);
        if (editorRef.current) {
          const newValue = editorRef.current.innerHTML;
          lastValueRef.current = newValue;
          onChange(newValue); // immediate update
        }
        isUpdatingRef.current = false;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      const newValue = editorRef.current.innerHTML;
      lastValueRef.current = newValue;
      onChange(newValue); // immediate update
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card" style={{ minHeight: "850px" }}>
      {/* Toolbar */}
      <div className="border-b border-border p-3 bg-muted/30">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 pr-3 border-r border-border">
            <button
              onClick={() => formatText("bold")}
              className="p-2 hover:bg-accent rounded-md"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => formatText("italic")}
              className="p-2 hover:bg-accent rounded-md"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => formatText("underline")}
              className="p-2 hover:bg-accent rounded-md"
              title="Underline"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 pr-3 border-r border-border">
            <button
              onClick={() => formatText("insertUnorderedList")}
              className="p-2 hover:bg-accent rounded-md"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => formatText("insertOrderedList")}
              className="p-2 hover:bg-accent rounded-md"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => formatText("formatBlock", "blockquote")}
              className="p-2 hover:bg-accent rounded-md"
              title="Quote"
            >
              <Quote size={16} />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 pr-3 border-r border-border">
            <button
              onClick={() => formatText("justifyLeft")}
              className="p-2 hover:bg-accent rounded-md"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => formatText("justifyCenter")}
              className="p-2 hover:bg-accent rounded-md"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => formatText("justifyRight")}
              className="p-2 hover:bg-accent rounded-md"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Media */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-accent rounded-md"
              title="Insert Image"
            >
              <ImageIcon size={16} />
            </button>
            <button
              onClick={() => setShowGraphModal(true)}
              className="p-2 hover:bg-accent rounded-md"
              title="Insert Graph"
            >
              <BarChart3 size={16} />
            </button>
            <button
              onClick={() => {
                const url = prompt("Enter URL:");
                if (url) formatText("createLink", url);
              }}
              className="p-2 hover:bg-accent rounded-md"
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
          unicodeBidi: "plaintext",
        }}
        data-placeholder={placeholder}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}