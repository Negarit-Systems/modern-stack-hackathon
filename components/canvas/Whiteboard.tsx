"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TextInputModal } from "../ui/InputModal";

interface WhiteboardCanvasProps {
  whiteboardId?: Id<"whiteboards">;
}

type Tool = "select" | "pen" | "rectangle" | "ellipse" | "text" | "arrow";

interface Point {
  x: number;
  y: number;
}

interface BaseElement {
  id: string;
  type: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

interface PathElement extends BaseElement {
  type: "path";
  points: Point[];
}

interface ShapeElement extends BaseElement {
  type: "rectangle" | "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextElement extends BaseElement {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize?: number;
}

type WhiteboardElement = PathElement | ShapeElement | TextElement;

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function WhiteboardCanvas({ whiteboardId }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textPosition, setTextPosition] = useState<Point | null>(null);

  // Convex data
  const whiteboard = useQuery(api.crud.whiteboard.get, {
    id: whiteboardId
  });
  const updateWhiteboard = useMutation(api.crud.whiteboard.update);

  // Delete selected elements
  const deleteSelectedElements = useCallback(() => {
    if (selectedElements.size === 0 || !whiteboard) return;

    const updatedElements = whiteboard.elements.filter(el => !selectedElements.has(el.id));

    updateWhiteboard({
      id: whiteboard._id,
      updates: {
        elements: updatedElements,
        updatedAt: Date.now(),
      }
    });

    setSelectedElements(new Set());
  }, [selectedElements, whiteboard, updateWhiteboard]);

  // Handle keyboard events for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.size > 0) {
        deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedElements, selectedElements.size]);

  // Check if point is inside element (simple bounding box check)
  const getElementBoundingBox = useCallback((element: WhiteboardElement) => {
    switch (element.type) {
      case "rectangle":
      case "ellipse":
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        };

      case "path":
        if (!element.points.length) return null;
        const minX = Math.min(...element.points.map(p => p.x));
        const maxX = Math.max(...element.points.map(p => p.x));
        const minY = Math.min(...element.points.map(p => p.y));
        const maxY = Math.max(...element.points.map(p => p.y));
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };

      case "text":
        // Approximate text bounding box
        return {
          x: element.x,
          y: element.y - 20, // Approximate text height
          width: 100, // Approximate text width
          height: 20
        };

      default:
        return null;
    }
  }, []);


  const isPointInElement = useCallback((element: WhiteboardElement, x: number, y: number): boolean => {
    const bbox = getElementBoundingBox(element);
    if (!bbox) return false;

    return x >= bbox.x &&
           x <= bbox.x + bbox.width &&
           y >= bbox.y &&
           y <= bbox.y + bbox.height;
  }, [getElementBoundingBox]);

  // Check if element is within selection box
  const isElementInSelectionBox = useCallback((element: WhiteboardElement, box: SelectionBox): boolean => {
    const bbox = getElementBoundingBox(element);
    if (!bbox) return false;

    const selectionLeft = Math.min(box.startX, box.endX);
    const selectionRight = Math.max(box.startX, box.endX);
    const selectionTop = Math.min(box.startY, box.endY);
    const selectionBottom = Math.max(box.startY, box.endY);

    // Check if element's bounding box overlaps with selection box (not necessarily fully inside)
    return (
      bbox.x < selectionRight &&
      bbox.x + bbox.width > selectionLeft &&
      bbox.y < selectionBottom &&
      bbox.y + bbox.height > selectionTop
    );
  }, [getElementBoundingBox]);

  // Drawing logic
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle selection
    if (tool === "select") {
      // Check if clicking on an existing element
      const clickedElement = whiteboard?.elements
        .filter((el): el is WhiteboardElement =>
          el.type === "path" ||
          el.type === "rectangle" ||
          el.type === "ellipse" ||
          el.type === "text"
        )
        .find(el => isPointInElement(el, x, y));

      if (clickedElement) {
        // Toggle selection of clicked element
        const newSelection = new Set(selectedElements);
        if (newSelection.has(clickedElement.id)) {
          newSelection.delete(clickedElement.id);
        } else {
          newSelection.add(clickedElement.id);
        }
        setSelectedElements(newSelection);
        setIsSelecting(false);
      } else {
        // Start area selection
        setIsSelecting(true);
        setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
        // Clear selection if not holding shift
        if (!e.shiftKey) {
          setSelectedElements(new Set());
        }
      }
      setIsDrawing(false);
      return;
    }

    setIsDrawing(true);

    switch (tool) {
      case "pen":
        setCurrentElement({
          type: "path",
          id: `temp-${Date.now()}`,
          points: [{ x, y }],
          stroke: color,
          strokeWidth,
        });
        break;
      case "rectangle":
        setCurrentElement({
          type: "rectangle",
          id: `temp-${Date.now()}`,
          x,
          y,
          width: 0,
          height: 0,
          stroke: color,
          strokeWidth,
          fill: "transparent",
        });
        break;
      case "ellipse":
        setCurrentElement({
          type: "ellipse",
          id: `temp-${Date.now()}`,
          x,
          y,
          width: 0,
          height: 0,
          stroke: color,
          strokeWidth,
          fill: "transparent",
        });
        break;
      case "text":
        setTextPosition({ x, y });
        setIsTextModalOpen(true);
        setIsDrawing(false);
        break;
    }
  }, [tool, color, strokeWidth, whiteboard, isPointInElement, selectedElements]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle selection box drawing
    if (isSelecting && selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, endX: x, endY: y } : null);
      return;
    }

    if (!isDrawing || !currentElement) return;

    switch (currentElement.type) {
      case "path":
        setCurrentElement(prev =>
          prev && prev.type === "path"
            ? { ...prev, points: [...prev.points, { x, y }] }
            : prev
        );
        break;
      case "rectangle":
      case "ellipse":
        setCurrentElement(prev =>
          prev && (prev.type === "rectangle" || prev.type === "ellipse")
            ? { ...prev, width: x - prev.x, height: y - prev.y }
            : prev
        );
        break;
    }
  }, [isDrawing, currentElement, isSelecting, selectionBox]);

  const stopDrawing = useCallback(() => {
    // Handle selection box completion
    if (isSelecting && selectionBox && whiteboard) {
      const selectedIds = new Set(selectedElements);
      whiteboard.elements
        .filter((el): el is WhiteboardElement =>
          el.type === "path" ||
          el.type === "rectangle" ||
          el.type === "ellipse" ||
          el.type === "text"
        )
        .forEach(element => {
          if (isElementInSelectionBox(element, selectionBox)) {
            selectedIds.add(element.id);
          }
        });
      setSelectedElements(selectedIds);
      setIsSelecting(false);
      setSelectionBox(null);
    }

    if (currentElement && tool !== "select" && tool !== "text") {
      // Replace temp ID with permanent one
      const element = {
        ...currentElement,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      addElement(element);
    }
    setIsDrawing(false);
    setCurrentElement(null);
  }, [isSelecting, selectionBox, whiteboard, selectedElements, isElementInSelectionBox, currentElement, tool]);

  const addElement = useCallback(async (element: WhiteboardElement) => {
    if (!whiteboard) return;

    try {
      await updateWhiteboard({
        id: whiteboard._id,
        updates: {
          elements: [...whiteboard.elements, element],
          updatedAt: Date.now(),
        }
      });
    } catch (error) {
      console.error('Error updating whiteboard:', error);
    }
  }, [whiteboard, updateWhiteboard]);

  // Clear selection when switching away from select tool
  useEffect(() => {
    if (tool !== "select") {
      setSelectedElements(new Set());
      setSelectionBox(null);
      setIsSelecting(false);
    }
  }, [tool]);

  const handleTextSubmit = useCallback((text: string) => {
    if (text && whiteboard && textPosition) {
      addElement({
        type: "text",
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: textPosition.x,
        y: textPosition.y,
        text,
        fontSize: 16,
        fill: color,
      });
    }
    setTextPosition(null);
  }, [whiteboard, textPosition, color, addElement]);

  // Render whiteboard
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements from Convex
    whiteboard?.elements.forEach(element => {
      ctx.strokeStyle = element.stroke || '#000000';
      ctx.lineWidth = element.strokeWidth || 2;
      ctx.fillStyle = element.fill || 'transparent';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw selection highlight
      if (selectedElements.has(element.id)) {
        ctx.strokeStyle = '#3b82f6'; // Blue selection color
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }

      switch (element.type) {
        case "path":
          if (element.points && element.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            element.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case "rectangle":
          ctx.strokeRect(
            element.x ?? 0,
            element.y ?? 0,
            element.width ?? 0,
            element.height ?? 0
          );
          if (element.fill && element.fill !== "transparent") {
            ctx.fillRect(
              element.x ?? 0,
              element.y ?? 0,
              element.width ?? 0,
              element.height ?? 0
            );
          }
          break;
        case "ellipse":
          ctx.beginPath();
          ctx.ellipse(
            (element.x ?? 0) + (element.width ?? 0) / 2,
            (element.y ?? 0) + (element.height ?? 0) / 2,
            Math.abs(element.width ?? 0) / 2,
            Math.abs(element.height ?? 0) / 2,
            0, 0, 2 * Math.PI
          );
          ctx.stroke();
          if (element.fill && element.fill !== "transparent") {
            ctx.fill();
          }
          break;
        case "text":
          ctx.fillStyle = element.fill || '#000000';
          ctx.font = `${element.fontSize || 16}px Arial`;
          ctx.fillText(element.text ?? "", element.x ?? 0, element.y ?? 0);
          break;
      }

      // Reset line dash for next element
      ctx.setLineDash([]);
    });

    // Draw selection box
    if (isSelecting && selectionBox) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

      const x = Math.min(selectionBox.startX, selectionBox.endX);
      const y = Math.min(selectionBox.startY, selectionBox.endY);
      const width = Math.abs(selectionBox.endX - selectionBox.startX);
      const height = Math.abs(selectionBox.endY - selectionBox.startY);

      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }

    // Draw current element in progress
    if (currentElement) {
      ctx.strokeStyle = currentElement.stroke || '#000000';
      ctx.lineWidth = currentElement.strokeWidth || 2;
      ctx.fillStyle = currentElement.fill || 'transparent';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);

      switch (currentElement.type) {
        case "path":
          if (currentElement.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentElement.points[0].x, currentElement.points[0].y);
            currentElement.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        case "rectangle":
          ctx.strokeRect(
            currentElement.x,
            currentElement.y,
            currentElement.width,
            currentElement.height
          );
          if (currentElement.fill && currentElement.fill !== "transparent") {
            ctx.fillRect(
              currentElement.x,
              currentElement.y,
              currentElement.width,
              currentElement.height
            );
          }
          break;
        case "ellipse":
          ctx.beginPath();
          ctx.ellipse(
            currentElement.x + currentElement.width / 2,
            currentElement.y + currentElement.height / 2,
            Math.abs(currentElement.width) / 2,
            Math.abs(currentElement.height) / 2,
            0, 0, 2 * Math.PI
          );
          ctx.stroke();
          if (currentElement.fill && currentElement.fill !== "transparent") {
            ctx.fill();
          }
          break;
      }
    }
  }, [whiteboard, currentElement, selectedElements, isSelecting, selectionBox]);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-300 bg-gray-50">
        <button
          onClick={() => {
            setTool("select");
            setSelectedElements(new Set());
          }}
          className={`p-2 rounded ${tool === "select" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Select
        </button>
        <button
          onClick={() => setTool("pen")}
          className={`p-2 rounded ${tool === "pen" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Pen
        </button>
        <button
          onClick={() => setTool("rectangle")}
          className={`p-2 rounded ${tool === "rectangle" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Rectangle
        </button>
        <button
          onClick={() => setTool("ellipse")}
          className={`p-2 rounded ${tool === "ellipse" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Ellipse
        </button>
        <button
          onClick={() => setTool("text")}
          className={`p-2 rounded ${tool === "text" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Text
        </button>

        <div className="flex items-center gap-2 ml-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8"
          />
          <select
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={1}>Thin</option>
            <option value={2}>Medium</option>
            <option value={4}>Thick</option>
            <option value={8}>Extra Thick</option>
          </select>
        </div>

        {/* Delete button */}
        {selectedElements.size > 0 && (
          <button
            onClick={deleteSelectedElements}
            className="ml-4 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete ({selectedElements.size})
          </button>
        )}

        <div className="ml-4 text-sm text-gray-600">
          {whiteboard?.elements.length || 0} elements
          {selectedElements.size > 0 && ` • ${selectedElements.size} selected`}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-auto">
        <canvas
          ref={canvasRef}
          width={1200}
          height={900}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair bg-white"
        />

        <TextInputModal
          isOpen={isTextModalOpen}
          onSubmit={handleTextSubmit}
          onClose={() => setIsTextModalOpen(false)}
        />
      </div>
    </div>
  );
}