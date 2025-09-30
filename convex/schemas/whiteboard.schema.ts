import { v } from "convex/values";

// In your convex/schema.ts
export const whiteboardsSchema = {
  sessionId: v.id("sessions"),
  title: v.string(),
  order: v.number(),
  elements: v.array(
    v.object({
      id: v.string(),
      type: v.union(
        v.literal("path"),
        v.literal("rectangle"),
        v.literal("ellipse"),
        v.literal("text"),
        v.literal("image"),
        v.literal("arrow")
      ),
      // Make x and y optional since path elements don't use them
      x: v.optional(v.number()),
      y: v.optional(v.number()),
      points: v.optional(v.array(v.object({ x: v.number(), y: v.number() }))),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      text: v.optional(v.string()),
      fontSize: v.optional(v.number()),
      stroke: v.optional(v.string()),
      strokeWidth: v.optional(v.number()),
      fill: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      // For arrows/flowcharts
      startElementId: v.optional(v.string()),
      endElementId: v.optional(v.string()),
    })
  ),
  updatedAt: v.number(),
}