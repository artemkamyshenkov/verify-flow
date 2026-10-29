import { useState } from "react";
import { createSession } from "./api";

export function useSession() {
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateSession() {
    setError(null);
    setIsCreating(true);

    try {
      const result = await createSession();

      if (!result.ok) {
        setError(result.error);
      }

      return result;
    } finally {
      setIsCreating(false);
    }
  }

  return { handleCreateSession, error, isCreating };
}
