import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core'

export function App() {
  return (
    <div className="app-layout">
      <Box component="header" className="app-header">
        <Container size="lg" py="lg">
          <Group gap="xs">
            <Text fw={700} size="lg">Verify</Text>
            <Text size="sm" c="dimmed">Проверка на двух устройствах</Text>
          </Group>
        </Container>
      </Box>

      <Box component="main" className="app-main">
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
            <Button size="md" radius="md" mt="sm">
              Начать сессию
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box component="footer" className="app-footer">
        <Container size="lg" py="lg">
          <Text size="xs" c="dimmed" ta="center">
            Verify · Проверка между устройствами
          </Text>
        </Container>
      </Box>
    </div>
  )
}
