import terms from "@/content/glossary.json";
export type Term = { term: string; definition: string; week: number };
export const glossary: Term[] = terms;
