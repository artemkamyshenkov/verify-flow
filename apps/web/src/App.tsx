import { Box, Container, Group, Text } from '@mantine/core'
import { Outlet } from 'react-router'

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
        <Outlet />
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
