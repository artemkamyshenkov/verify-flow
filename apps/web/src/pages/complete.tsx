import { Container, Stack, Text, Title } from "@mantine/core";

export function CompletePage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg" ta="center">
        <Text size="sm" fw={600} c="green">
          Фото успешно загружено
        </Text>
        <Title order={1}>Спасибо! Документ отправлен</Title>
        <Text c="dimmed" size="lg" maw={420}>
          Мы сообщим вам результат проверки. Эту страницу можно закрыть.
        </Text>
      </Stack>
    </Container>
  );
}
