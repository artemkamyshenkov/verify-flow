import { useEffect } from "react";
import { useNavigate } from "react-router";

export function useEvents(sessionId?: string) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const source = new EventSource(`/api/sessions/${sessionId}/events`);

    source.addEventListener("photo-uploaded", () => {
      navigate(`/sessions/${sessionId}/complete`, { replace: true });
    });

    return () => {
      source.close();
    };
  }, [sessionId, navigate]);
}
