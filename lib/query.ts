import "server-only";
import { database } from "./db";
import type { Query } from "./progress-repository";
export const query: Query = async (text, values = []) =>
  database().query(text, values);
