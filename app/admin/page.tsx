'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconArrowRight,
  IconBread,
  IconCurrencyEuro,
  IconShoppingCart,
  IconUsers,
} from '@tabler/icons-react';
import {
  Badge,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import AppLayout from '@/components/AppLayout';

import 'dayjs/locale/fr';

dayjs.locale('fr');

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const statsData = await response.json();
        setData(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  const stats = [
    { title: 'Utilisateurs', icon: IconUsers, value: data?.stats.users, color: 'blue' },
    { title: 'Produits', icon: IconBread, value: data?.stats.products, color: 'orange' },
    { title: 'Commandes', icon: IconShoppingCart, value: data?.stats.orders, color: 'teal' },
    {
      title: 'CA Total',
      icon: IconCurrencyEuro,
      value: `${data?.stats.revenue.toFixed(2)} €`,
      color: 'green',
    },
  ];

  return (
    <AppLayout user={user}>
      <Container size="xl">
        <Stack gap="xl">
          <Title order={2}>Tableau de Bord Administrateur</Title>

          <Grid>
            {stats.map((stat) => (
              <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
                <Paper withBorder p="md" radius="md">
                  <Group justify="space-between">
                    <div>
                      <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                        {stat.title}
                      </Text>
                      <Text fw={700} fz="xl">
                        {stat.value}
                      </Text>
                    </div>
                    <ThemeIcon color={stat.color} variant="light" size={48} radius="md">
                      <stat.icon size={28} stroke={1.5} />
                    </ThemeIcon>
                  </Group>
                </Paper>
              </Grid.Col>
            ))}
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb="md">
                  Commandes Récentes
                </Title>
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Client</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Statut</Table.Th>
                      <Table.Th ta="right">Montant</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {data?.recentOrders.map((order: any) => (
                      <Table.Tr
                        key={order.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => router.push('/admin/orders')}
                      >
                        <Table.Td>
                          {order.user.firstName} {order.user.lastName}
                        </Table.Td>
                        <Table.Td>{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</Table.Td>
                        <Table.Td>
                          <Badge size="sm" variant="light">
                            {order.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="right">{order.totalAmount.toFixed(2)} €</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb="md">
                  Top Produits
                </Title>
                <Stack gap="sm">
                  {data?.topProducts.map((p: any) => (
                    <Group
                      key={p.name}
                      justify="space-between"
                      p="xs"
                      style={{ borderBottom: '1px solid #eee' }}
                    >
                      <div>
                        <Text fw={500} size="sm">
                          {p.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {typeof p.category === 'object'
                            ? p.category?.name
                            : p.category || 'Autres'}
                        </Text>
                      </div>
                      <Badge color="blue" variant="filled" circle>
                        {p.totalQuantity}
                      </Badge>
                    </Group>
                  ))}
                  {data?.topProducts.length === 0 && (
                    <Text ta="center" c="dimmed" py="xl">
                      Aucune donnée de vente
                    </Text>
                  )}
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </AppLayout>
  );
}
