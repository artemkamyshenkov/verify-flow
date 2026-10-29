import { Button, Stack, Text } from "@mantine/core";
import { useSession } from "./use-session";

export function SessionView() {
  const { handleCreateSession, error, isCreating } = useSession();

  return (
    <Stack align="center" gap="sm" mt="sm">
      <Button
        size="md"
        radius="md"
        loading={isCreating}
        onClick={() => void handleCreateSession()}
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
