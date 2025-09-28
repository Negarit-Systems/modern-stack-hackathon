"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);
  const lastValueRef = useRef<string>(value);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastCursorPositionRef = useRef<{ offset: number; nodeIndex: number; containerNodeName?: string; containerOffset?: number } | null>(null);

  // Enhanced cursor position management with better precision
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      
      // Use a more precise method to calculate text offset
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      
      // Get the text content up to cursor position
      const textBeforeCursor = preCaretRange.toString();
      
      return {
        offset: textBeforeCursor.length,
        nodeIndex: 0,
        // Store additional context for better restoration
        containerNodeName: range.endContainer.nodeName,
        containerOffset: range.endOffset
      };
    }
    return null;
  }, []);

  const restoreCursorPosition = useCallback((position: { offset: number; nodeIndex: number; containerNodeName?: string; containerOffset?: number } | null) => {
    if (!position || !editorRef.current) return;
    
    try {
      const selection = window.getSelection();
      if (!selection) return;
      
      // More precise restoration using text content matching
      const targetOffset = position.offset;
      let currentOffset = 0;
      
      // Create a range to traverse the content
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      
      // Walk through all text nodes to find the exact position
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let textNode;
      while (textNode = walker.nextNode()) {
        const nodeLength = textNode.textContent?.length || 0;
        
        if (currentOffset + nodeLength >= targetOffset) {
          // Found the target text node
          const offsetInNode = targetOffset - currentOffset;
          const newRange = document.createRange();
          
          // Ensure offset doesn't exceed node length
          const safeOffset = Math.min(offsetInNode, nodeLength);
          newRange.setStart(textNode, safeOffset);
          newRange.collapse(true);
          
          selection.removeAllRanges();
          selection.addRange(newRange);
          return;
        }
        
        currentOffset += nodeLength;
      }
      
      // If we couldn't find the exact position, place cursor at the end
      const fallbackRange = document.createRange();
      fallbackRange.selectNodeContents(editorRef.current);
      fallbackRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(fallbackRange);
      
    } catch (error) {
      // Final fallback: place cursor at end
      const selection = window.getSelection();
      if (selection && editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, []);

  // Debounced onChange to prevent excessive updates
  const debouncedOnChange = useCallback((newValue: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newValue);
      isTypingRef.current = false;
    }, 300); // 300ms debounce
  }, [onChange]);

  // Only sync external changes when user is not actively typing
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current && !isTypingRef.current) {
      const currentContent = editorRef.current.innerHTML;
      if (currentContent !== value && lastValueRef.current !== value) {
        const cursorPosition = saveCursorPosition();
        editorRef.current.innerHTML = value;
        lastValueRef.current = value;
        
        // Only restore cursor if the user was actively editing
        if (cursorPosition && document.activeElement === editorRef.current) {
          // Small delay to ensure DOM is updated
          requestAnimationFrame(() => {
            restoreCursorPosition(cursorPosition);
          });
        }
      }
    }
  }, [value, saveCursorPosition, restoreCursorPosition]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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

  // Image compression utility
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;

    setIsUploadingImage(true);
    
    try {
      // Save cursor position before insertion
      const cursorPosition = saveCursorPosition();
      
      // Compress image to reduce lag
      const compressedDataUrl = await compressImage(file, 800, 0.7);
      
      // Create image element
      const img = document.createElement('img');
      img.src = compressedDataUrl;
      img.alt = 'Uploaded image';
      img.style.cssText = 'max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; display: block;';
      
      // Insert image at cursor position
      isUpdatingRef.current = true;
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Insert image and add a line break after it
        range.insertNode(img);
        range.collapse(false);
        
        // Add a paragraph after the image for continued typing
        const br = document.createElement('br');
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append to end
        editorRef.current.appendChild(img);
        editorRef.current.appendChild(document.createElement('br'));
      }
      
      // Update content with debouncing
      const newValue = editorRef.current.innerHTML;
      lastValueRef.current = newValue;
      isTypingRef.current = true;
      debouncedOnChange(newValue);
      
      isUpdatingRef.current = false;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      isUpdatingRef.current = false;
    } finally {
      setIsUploadingImage(false);
    }
    
    // Clear the input
    e.target.value = '';
  }, [saveCursorPosition, debouncedOnChange]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const newValue = editorRef.current.innerHTML;
      
      // Only update if content actually changed
      if (newValue !== lastValueRef.current) {
        lastValueRef.current = newValue;
        isTypingRef.current = true;
        lastCursorPositionRef.current = saveCursorPosition();
        
        // Use debounced update for better performance
        debouncedOnChange(newValue);
      }
    }
  }, [debouncedOnChange, saveCursorPosition]);

  // Handle input events with better cursor management
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    handleContentChange();
  }, [handleContentChange]);

  // Handle key events to track typing state
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    isTypingRef.current = true;
  }, []);

  // Handle focus events
  const handleFocus = useCallback(() => {
    if (lastCursorPositionRef.current) {
      requestAnimationFrame(() => {
        restoreCursorPosition(lastCursorPositionRef.current);
      });
    }
  }, [restoreCursorPosition]);

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
              disabled={isUploadingImage}
              className={`p-2 hover:bg-accent rounded-md ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isUploadingImage ? "Uploading..." : "Insert Image"}
            >
              {isUploadingImage ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <ImageIcon size={16} />
              )}
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
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={() => { isTypingRef.current = false; }}
        className="min-h-[500px] p-6 focus:outline-none prose prose-sm max-w-none"
        style={{
          lineHeight: "1.6",
          fontSize: "16px",
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "plaintext",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
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