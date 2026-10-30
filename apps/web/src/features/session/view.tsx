import { Button, Stack, Text } from "@mantine/core";
import { useSession } from "./use-session";
import { useNavigate } from "react-router";

export function SessionView() {
  const { handleCreateSession, error, isCreating } = useSession();
  const navigate = useNavigate();

  async function handleCreate() {
    const result = await handleCreateSession();

    if (result.ok) {
      navigate(`/sessions/${result.data.id}/connect`);
    }
  }

  return (
    <Stack align="center" gap="sm" mt="sm">
      <Button
        size="md"
        radius="md"
        loading={isCreating}
        onClick={() => void handleCreate()}
      >
        Начать сессию
      </Button>
      {error && (
        <Text role="alert" size="sm" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
}
