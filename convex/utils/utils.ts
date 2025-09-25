import { v } from "convex/values";
import { authComponent } from "../auth";
import { GenericCtx, query } from "../_generated/server";

export function makePartial(fields: Record<string, any>) {
  const partial: Record<string, any> = {};
  for (const key in fields) {
    partial[key] = v.optional(fields[key]);
  }
  return partial;
}

export const authenticatedUser = async (ctx: GenericCtx) => {
  const auth = await authComponent.getAuthUser(ctx);
  return auth._id;
};
