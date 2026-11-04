import { Button, Container, Stack, Text } from "@mantine/core";
import { useNavigate, useParams } from "react-router";
import { useJoinSession } from "../features/session/use-session";

export function JoinPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { handleJoinSession, isLoading, error } = useJoinSession(sessionId);

  async function handleJoin() {
    const result = await handleJoinSession();

    if (result.ok) {
      navigate(`/sessions/${sessionId}/capture`);
    }
  }

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="sm" mt="sm">
        <Button size="md" radius="md" onClick={handleJoin} loading={isLoading}>
          Подключиться
        </Button>
        {error && (
          <Text role="alert" size="sm" c="red" ta="center">
            {error}
          </Text>
        )}
      </Stack>
    </Container>
  );
}
