'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconUser, IconUserShield } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/components/AppLayout';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'ADMIN') {
      router.push('/order');
      return;
    }

    setUser(userData);
    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, data: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: userId, ...data }),
      });

      if (response.ok) {
        notifications.show({ title: 'Succès', message: 'Utilisateur mis à jour', color: 'green' });
        fetchUsers(token!);
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Échec de la mise à jour', color: 'red' });
    }
  };

  if (loading && users.length === 0)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <AppLayout user={user}>
      <Container size="xl">
        <Stack gap="lg">
          <Title order={2}>Gestion des Utilisateurs</Title>

          <Paper withBorder p="md" radius="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Utilisateur</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Rôle</Table.Th>
                  <Table.Th ta="center">Actif</Table.Th>
                  <Table.Th>Adresse</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <ThemeIcon color={u.role === 'ADMIN' ? 'red' : 'blue'} variant="light">
                          {u.role === 'ADMIN' ? (
                            <IconUserShield size={16} />
                          ) : (
                            <IconUser size={16} />
                          )}
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={500}>
                            {u.firstName} {u.lastName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {u.email}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{u.phone || 'Non renseigné'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Select
                        size="xs"
                        data={[
                          { value: 'ADMIN', label: 'Admin' },
                          { value: 'CLIENT', label: 'Client' },
                        ]}
                        value={u.role}
                        onChange={(val) => updateUser(u.id, { role: val })}
                        disabled={u.id === user?.id} // Empêcher l'admin de se changer son propre rôle
                      />
                    </Table.Td>
                    <Table.Td ta="center">
                      <Switch
                        checked={u.isActive}
                        onChange={(e) => updateUser(u.id, { isActive: e.currentTarget.checked })}
                        disabled={u.id === user?.id}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" color="dimmed" lineClamp={1}>
                        {u.address}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  );
}

// Composant Helper interne pour éviter une erreur d'import
function ThemeIcon({ children, color, variant }: any) {
  return (
    <div
      style={{
        backgroundColor:
          variant === 'light' ? `var(--mantine-color-${color}-light)` : 'transparent',
        padding: '8px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: `var(--mantine-color-${color}-filled)`,
      }}
    >
      {children}
    </div>
  );
}
