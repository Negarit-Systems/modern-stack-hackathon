import { v } from "convex/values";

export function makePartial(fields: Record<string, any>) {
  const partial: Record<string, any> = {};
  for (const key in fields) {
    partial[key] = v.optional(fields[key]);
  }
  return partial;
}
