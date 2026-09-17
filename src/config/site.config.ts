import instance from "./site.json";
import { InstanceConfigSchema } from "./schema";
import { resolveSiteEnvironment } from "./site-runtime.mjs";
import { getTheme } from "../themes/registry";
export { InstanceConfigSchema, NavItemSchema } from "./schema";
export type { InstanceConfig, NavItem } from "./schema";
const parsed = InstanceConfigSchema.parse(instance);
getTheme(parsed.theme); // Unknown instance themes are configuration errors, never silent fallbacks.
export const siteEnvironment = resolveSiteEnvironment(parsed, import.meta.env);
export const siteConfig = { ...parsed, siteUrl: siteEnvironment.siteUrl };
