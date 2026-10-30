import { Container, Stack, Text, Title } from '@mantine/core'
import { SessionView } from '../features/session/view'

export function StartPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg" ta="center">
        <Text size="xs" fw={600} c="blue" tt="uppercase" lts="0.12em">
          Одна сессия · Два устройства
        </Text>
        <Title order={1} className="app-title">
          Начните здесь.
          <br />
          Продолжите на телефоне.
        </Title>
        <Text c="dimmed" size="lg" maw={420}>
          Создайте сессию, чтобы связать компьютер и телефон
          и пройти проверку.
        </Text>
        <SessionView />
      </Stack>
    </Container>
  )
}
