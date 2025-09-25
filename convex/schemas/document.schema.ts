import { v } from "convex/values";

export const documentSchema = {
  title: v.string(),
  content: v.string(),
  lastModified: v.number(),
  collaborators: v.array(v.string()),
};
