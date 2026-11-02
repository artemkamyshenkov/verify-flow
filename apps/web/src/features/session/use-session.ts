import { useState } from "react";
import { createSession, joinSession } from "./api";

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

export function useJoinSession(sessionId?: string) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleJoinSession() {
    setError(null);
    setIsLoading(true);

    try {
      const result = await joinSession(sessionId);

      if (!result.ok) {
        setError(result.error);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  }

  return { handleJoinSession, error, isLoading };
}
