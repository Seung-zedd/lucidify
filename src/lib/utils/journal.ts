export interface DreamEntry {
  id: string;
  createdAt: string;
  userPrompt: string;
  analysisResult: {
    title: string;
    insight: string;
    keywords: string[];
  };
  videoGenerationPrompt: string;
}

const STORAGE_KEY = "lucidify_dream_journal";

/**
 * Gets all dream entries from local storage, sorted by date (newest first).
 */
export function getDreamEntries(): DreamEntry[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const entries: DreamEntry[] = JSON.parse(stored);
    // Sort by createdAt descending (newest first)
    return entries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (e) {
    console.error("Failed to parse dream journal entries:", e);
    return [];
  }
}

/**
 * Saves a new dream entry to local storage.
 */
export function saveDreamEntry(
  entry: Omit<DreamEntry, "id" | "createdAt">,
): DreamEntry {
  const newEntry: DreamEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const currentEntries = getDreamEntries();
  const updatedEntries = [newEntry, ...currentEntries];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  return newEntry;
}

/**
 * Deletes a dream entry from local storage by ID.
 */
export function deleteDreamEntry(id: string): void {
  const currentEntries = getDreamEntries();
  const updatedEntries = currentEntries.filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
}

/**
 * Deletes a dream entry from local storage by prompt.
 */
export function deleteDreamEntryByPrompt(userPrompt: string): void {
  const currentEntries = getDreamEntries();
  const updatedEntries = currentEntries.filter(
    (entry) => entry.userPrompt !== userPrompt,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
}

/**
 * Checks if a dream (by prompt) is already saved.
 * Use this to toggle the Bookmark icon state.
 */
export function isDreamSaved(userPrompt: string): boolean {
  const entries = getDreamEntries();
  return entries.some((entry) => entry.userPrompt === userPrompt);
}
