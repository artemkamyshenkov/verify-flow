import {
  Button,
  Container,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router";
import { useEvents } from "../features/connected/useEvents";

export function ConnectPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const clipboard = useClipboard({ timeout: 2000 });
  useEvents(sessionId);

  if (!sessionId) {
    return <Text role="alert">Не указан идентификатор сессии.</Text>;
  }

  const joinUrl = new URL(
    `/sessions/${encodeURIComponent(sessionId)}/join`,
    window.location.origin,
  ).href;

  return (
    <Container size="xs" py="xl" w="100%">
      <Stack align="center" gap="lg">
        <Title order={1} ta="center">
          Подключите телефон
        </Title>
        <Text c="dimmed" ta="center">
          Отсканируйте QR-код камерой телефона или откройте на нём ссылку.
        </Text>
        <QRCodeSVG
          value={joinUrl}
          size={200}
          marginSize={4}
          role="img"
          aria-label="QR-код ссылки для подключения к сессии"
        />
        <TextInput
          label="Ссылка для подключения"
          value={joinUrl}
          readOnly
          w="100%"
        />
        <Button onClick={() => clipboard.copy(joinUrl)} radius="md">
          {clipboard.copied ? "Ссылка скопирована" : "Скопировать ссылку"}
        </Button>
        {clipboard.error && (
          <Text role="alert" size="sm" c="red" ta="center">
            Не удалось скопировать ссылку. Скопируйте её из поля выше.
          </Text>
        )}
      </Stack>
    </Container>
  );
}
