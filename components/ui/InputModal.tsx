import { useEffect, useRef, useState } from "react";

interface TextInputModalProps {
  isOpen: boolean;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

export function TextInputModal({ isOpen, onSubmit, onClose }: TextInputModalProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-18">
      <div className="bg-white rounded-xl p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
        <h2 className="text-lg font-semibold mb-4">Enter Text</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border rounded mb-4"
            placeholder="Type your text here"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setText("");
                onClose();
              }}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}