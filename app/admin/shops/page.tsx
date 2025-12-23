'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconBuildingStore, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/components/AppLayout';

export default function AdminShopsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      isActive: true,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Le nom est trop court' : null),
    },
  });

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
    fetchShops();
  }, [router]);

  const fetchShops = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/shops', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setShops(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    const token = localStorage.getItem('token');
    const url = editingId ? `/api/shops/${editingId}` : '/api/shops';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        notifications.show({
          title: 'Succès',
          message: editingId ? 'Boutique mise à jour' : 'Boutique créée',
          color: 'green',
        });
        setModalOpened(false);
        setEditingId(null);
        form.reset();
        fetchShops();
      } else {
        const error = await response.json();
        notifications.show({ title: 'Erreur', message: error.error, color: 'red' });
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Erreur réseau', color: 'red' });
    }
  };

  const handleEdit = (shop: any) => {
    setEditingId(shop.id);
    form.setValues({
      name: shop.name,
      description: shop.description || '',
      isActive: shop.isActive,
    });
    setModalOpened(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Voulez-vous vraiment supprimer définitivement la boutique "${name}" ?\nCette action est irréversible et n'est possible que si la boutique ne contient aucun produit.`
      )
    )
      return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/shops/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        notifications.show({ title: 'Succès', message: 'Boutique supprimée', color: 'green' });
        fetchShops();
      } else {
        const error = await response.json();
        notifications.show({ title: 'Erreur', message: error.error, color: 'red' });
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Erreur réseau', color: 'red' });
    }
  };

  const handleToggleStatus = async (shop: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !shop.isActive }),
      });

      if (response.ok) {
        fetchShops();
      }
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  if (loading && shops.length === 0)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <AppLayout user={user}>
      <Container size="xl">
        <Stack gap="lg">
          <Group justify="space-between">
            <Title order={2}>Gestion des Boutiques</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingId(null);
                form.reset();
                setModalOpened(true);
              }}
              color="blue"
            >
              Nouvelle Boutique
            </Button>
          </Group>

          <Paper withBorder p="md" radius="md">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nom / Description</Table.Th>
                  <Table.Th ta="center">Statut</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {shops.map((shop) => (
                  <Table.Tr key={shop.id}>
                    <Table.Td>
                      <Text fw={500} c={shop.isActive ? undefined : 'dimmed'}>
                        {shop.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {shop.description}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Group justify="center">
                        <Switch
                          checked={shop.isActive}
                          onChange={() => handleToggleStatus(shop)}
                          color="green"
                          size="sm"
                        />
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEdit(shop)}
                          title="Modifier"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(shop.id, shop.name)}
                          title="Supprimer définitivement"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>

        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={editingId ? 'Modifier la Boutique' : 'Ajouter une Boutique'}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput label="Nom de la boutique" required {...form.getInputProps('name')} />
              <TextInput label="Description" {...form.getInputProps('description')} />
              <Switch
                label="Boutique active"
                {...form.getInputProps('isActive', { type: 'checkbox' })}
              />
              <Button type="submit" fullWidth color="blue" mt="md">
                {editingId ? 'Enregistrer' : 'Créer la boutique'}
              </Button>
            </Stack>
          </form>
        </Modal>
      </Container>
    </AppLayout>
  );
}
