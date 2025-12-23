'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendar, IconClipboardList, IconUser } from '@tabler/icons-react';
import {
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
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import AppLayout from '@/components/AppLayout';

import 'dayjs/locale/fr';

dayjs.locale('fr');

export default function AdminOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    fetchOrders(token);
  }, [router]);

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);

        if (data.length > 0) {
          const dates = Array.from(
            new Set(data.map((o: any) => dayjs(o.deliveryDate).format('YYYY-MM-DD')))
          ).sort();
          setSelectedDate(dates[0] as string);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
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

  const deliveryDates = Array.from(
    new Set(orders.map((o) => dayjs(o.deliveryDate).format('YYYY-MM-DD')))
  ).sort() as string[];

  const filteredOrders = selectedDate
    ? orders.filter((o) => dayjs(o.deliveryDate).format('YYYY-MM-DD') === selectedDate)
    : orders;

  const shopsSummary = filteredOrders.reduce((acc: any, order: any) => {
    order.orderItems.forEach((item: any) => {
      const shopName = item.product.shop?.name || 'Boulangerie';
      const productName = item.product.name;

      if (!acc[shopName]) {
        acc[shopName] = {};
      }

      if (!acc[shopName][productName]) {
        acc[shopName][productName] = {
          quantity: 0,
          categoryName: item.product.category?.name || 'Autres',
        };
      }
      acc[shopName][productName].quantity += item.quantity;
    });
    return acc;
  }, {});

  return (
    <AppLayout user={user}>
      <Container size="xl">
        <Stack gap="lg">
          <Group justify="space-between">
            <Title order={2}>Gestion des Commandes</Title>
            <Select
              label="Filtrer par date de livraison"
              placeholder="Choisir une date"
              data={deliveryDates.map((date) => ({
                value: date,
                label: dayjs(date).format('dddd D MMMM YYYY'),
              }))}
              value={selectedDate}
              onChange={setSelectedDate}
              leftSection={<IconCalendar size={16} />}
              style={{ width: 330 }}
            />
          </Group>

          <Tabs defaultValue="summary">
            <Tabs.List>
              <Tabs.Tab value="summary" leftSection={<IconClipboardList size={14} />}>
                Approvisionnement
              </Tabs.Tab>
              <Tabs.Tab value="details" leftSection={<IconUser size={14} />}>
                Détails par Client
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="summary" pt="md">
              <Stack gap="xl">
                {Object.entries(shopsSummary)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([shopName, summary]: [string, any]) => {
                    const totalItems = Object.values(summary).reduce(
                      (sum: number, item: any) => sum + item.quantity,
                      0
                    );
                    return (
                      <Paper key={shopName} withBorder shadow="sm" p="xl" radius="md">
                        <Group justify="space-between" mb="lg">
                          <Title
                            order={3}
                            c="blue"
                            style={{
                              borderLeft: '4px solid var(--mantine-color-blue-6)',
                              paddingLeft: '12px',
                            }}
                          >
                            🏪 {shopName}
                          </Title>
                          <Badge size="lg" color="blue" variant="filled">
                            {totalItems} articles au total
                          </Badge>
                        </Group>

                        <Table striped highlightOnHover verticalSpacing="md" withTableBorder>
                          <Table.Thead>
                            <Table.Tr bg="gray.0">
                              <Table.Th>Produit</Table.Th>
                              <Table.Th>Catégorie</Table.Th>
                              <Table.Th ta="right">Quantité Totale</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {Object.entries(summary)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([name, data]: [string, any]) => (
                                <Table.Tr key={name}>
                                  <Table.Td fw={700}>{name}</Table.Td>
                                  <Table.Td>
                                    <Badge
                                      color={
                                        data.categoryName.toUpperCase() === 'PAIN'
                                          ? 'orange'
                                          : data.categoryName.toUpperCase() === 'VIENNOISERIE'
                                            ? 'yellow'
                                            : 'teal'
                                      }
                                      variant="light"
                                    >
                                      {data.categoryName}
                                    </Badge>
                                  </Table.Td>
                                  <Table.Td
                                    ta="right"
                                    fw={900}
                                    style={{
                                      color: 'var(--mantine-color-blue-filled)',
                                      fontSize: '1.2rem',
                                    }}
                                  >
                                    {data.quantity}
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                          </Table.Tbody>
                        </Table>
                      </Paper>
                    );
                  })}

                {Object.keys(shopsSummary).length === 0 && (
                  <Paper withBorder shadow="sm" p="xl" radius="md" ta="center">
                    <Text c="dimmed">Aucune commande pour cette date</Text>
                  </Paper>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="details" pt="md">
              <Paper withBorder shadow="sm" p="md" radius="md">
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Commande #</Table.Th>
                      <Table.Th>Client</Table.Th>
                      <Table.Th>Articles</Table.Th>
                      <Table.Th ta="right">Total</Table.Th>
                      <Table.Th ta="center">Distribution</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredOrders.map((order) => (
                      <Table.Tr
                        key={order.id}
                        bg={order.isPickedUp ? 'rgba(0, 255, 0, 0.05)' : undefined}
                      >
                        <Table.Td>
                          <Text size="sm" ff="monospace" fw={700}>
                            {order.orderNumber.split('-').pop()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {order.user.firstName} {order.user.lastName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {order.user.phone || 'Pas de numéro'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {order.orderItems.map((item: any) => (
                            <div key={item.id}>
                              <Text size="xs">
                                {item.quantity}x {item.product.name}
                              </Text>
                              {item.notes && (
                                <Text size="10px" c="dimmed" mt={-2} mb={2} fs="italic">
                                  ({item.notes})
                                </Text>
                              )}
                            </div>
                          ))}
                        </Table.Td>
                        <Table.Td ta="right" fw={700}>
                          {order.totalAmount.toFixed(2)} €
                        </Table.Td>
                        <Table.Td ta="center">
                          <Group justify="center">
                            <Switch
                              checked={order.isPickedUp}
                              onChange={async (event) => {
                                const checked = event.currentTarget.checked;
                                const token = localStorage.getItem('token');
                                try {
                                  const response = await fetch(`/api/orders/${order.id}`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ isPickedUp: checked }),
                                  });
                                  if (response.ok) {
                                    setOrders(
                                      orders.map((o) =>
                                        o.id === order.id ? { ...o, isPickedUp: checked } : o
                                      )
                                    );
                                  }
                                } catch (error) {
                                  console.error('Update pick up status failed', error);
                                }
                              }}
                              color="green"
                              size="md"
                              onLabel="OK"
                              offLabel="NON"
                            />
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={5} ta="center">
                          Aucune commande détaillée
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </AppLayout>
  );
}
