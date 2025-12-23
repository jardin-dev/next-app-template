'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendar, IconCurrencyEuro, IconHistory, IconPackage } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Container,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import AppLayout from '@/components/AppLayout';

import 'dayjs/locale/fr';

// Support pour Grid qui n'était pas importé
import { Grid } from '@mantine/core';

dayjs.locale('fr');

export default function MyOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);
  const [frequentProducts, setFrequentProducts] = useState<any[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, boolean>>(
    {}
  );
  const [recommendationQuantities, setRecommendationQuantities] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userStr));
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
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'gray';
      case 'CONFIRMED':
        return 'blue';
      case 'PREPARING':
        return 'orange';
      case 'DELIVERED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PREPARING':
        return 'En préparation';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  const handleNewOrderClick = () => {
    // Analyser les commandes précédentes pour trouver les produits fréquents
    const productStats: Record<string, { product: any; count: number }> = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item: any) => {
        if (!productStats[item.product.id]) {
          productStats[item.product.id] = { product: item.product, count: 0 };
        }
        productStats[item.product.id].count += item.quantity;
      });
    });

    const sortedProducts = Object.values(productStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3) // Top 3
      .map((p) => p.product);

    if (sortedProducts.length > 0) {
      setFrequentProducts(sortedProducts);
      // Pré-selectionner le premier
      const initialSelection: Record<string, boolean> = {};
      const initialQuantities: Record<string, number> = {};
      sortedProducts.forEach((p, index) => {
        initialSelection[p.id] = index === 0; // Seul le top 1 est sélectionné par défaut
        initialQuantities[p.id] = 1;
      });
      setSelectedRecommendations(initialSelection);
      setRecommendationQuantities(initialQuantities);
      setRecommendationModalOpen(true);
    } else {
      router.push('/order');
    }
  };

  const confirmRecommendations = () => {
    const itemsToAdd = frequentProducts
      .filter((p) => selectedRecommendations[p.id])
      .map((p) => ({
        ...p,
        quantity: recommendationQuantities[p.id] || 1,
      }));

    if (itemsToAdd.length > 0) {
      // Récupérer le panier actuel
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      // Ajouter les items
      itemsToAdd.forEach((newItem) => {
        const existingItemIndex = cart.findIndex((item: any) => item.id === newItem.id);
        if (existingItemIndex >= 0) {
          cart[existingItemIndex].quantity += newItem.quantity;
        } else {
          cart.push(newItem);
        }
      });

      localStorage.setItem('cart', JSON.stringify(cart));
    }

    setRecommendationModalOpen(false);
    router.push('/order');
  };

  if (loading)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <AppLayout user={user}>
      <Container size="lg">
        <Stack gap="xl">
          <Group justify="space-between">
            <Group gap="sm">
              <IconHistory size={28} color="var(--mantine-color-blue-filled)" />
              <Title order={2}>Mes Commandes</Title>
            </Group>
            <Button
              variant="light"
              leftSection={<IconPackage size={16} />}
              onClick={handleNewOrderClick}
            >
              Nouvelle Commande
            </Button>
          </Group>

          {orders.length === 0 ? (
            <Paper shadow="xs" p="xl" withBorder radius="md" ta="center">
              <Text size="lg" c="dimmed" mb="md">
                Vous n'avez pas encore passé de commande.
              </Text>
              <Button onClick={() => router.push('/order')}>Commander mon pain</Button>
            </Paper>
          ) : (
            <Stack gap="md">
              {orders.map((order) => (
                <Paper key={order.id} shadow="xs" p="md" withBorder radius="md">
                  <Grid gutter="xs">
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Stack gap={2}>
                        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                          Commande #
                        </Text>
                        <Text size="sm" ff="monospace">
                          {order.orderNumber.split('-').pop()}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          Le {dayjs(order.createdAt).format('DD/MM/YYYY à HH:mm')}
                        </Text>
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, sm: 3 }}>
                      <Stack gap={2}>
                        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                          Livraison
                        </Text>
                        <Group gap={4}>
                          <IconCalendar size={14} />
                          <Text size="sm" fw={500}>
                            {dayjs(order.deliveryDate).format('DD/MM/YYYY')}
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, sm: 2 }}>
                      <Stack gap={2}>
                        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                          Total
                        </Text>
                        <Text size="sm" fw={700} c="blue">
                          {order.totalAmount.toFixed(2)} €
                        </Text>
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 3 }} ta={{ sm: 'right' }}>
                      <Badge color={getStatusColor(order.status)} size="lg" radius="sm">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </Grid.Col>
                  </Grid>

                  <Divider my="sm" />

                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4}>
                    Articles :
                  </Text>
                  <Group gap="xs">
                    {order.orderItems.map((item: any) => (
                      <Badge key={item.id} variant="light" color="gray" size="sm">
                        {item.quantity}x {item.product.name}
                      </Badge>
                    ))}
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>

      <Modal
        opened={recommendationModalOpen}
        onClose={() => router.push('/order')}
        title="Vos produits habituels"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Voulez-vous ajouter ces produits fréquents à votre nouvelle commande ?
          </Text>
          {frequentProducts.map((product) => (
            <Paper key={product.id} withBorder p="sm" radius="md">
              <Group justify="space-between" align="center">
                <Group gap="sm" style={{ flex: 1 }}>
                  <Checkbox
                    checked={selectedRecommendations[product.id] || false}
                    onChange={(event) =>
                      setSelectedRecommendations((prev) => ({
                        ...prev,
                        [product.id]: event.currentTarget.checked,
                      }))
                    }
                  />
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      w={40}
                      h={40}
                      radius="sm"
                      fallbackSrc="https://placehold.co/100x100?text=Pain"
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <Text fw={500} size="sm" lineClamp={1}>
                      {product.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {product.price.toFixed(2)} €
                    </Text>
                  </div>
                </Group>

                {selectedRecommendations[product.id] && (
                  <NumberInput
                    value={recommendationQuantities[product.id]}
                    onChange={(val) =>
                      setRecommendationQuantities((prev) => ({
                        ...prev,
                        [product.id]: Number(val) || 1,
                      }))
                    }
                    min={1}
                    max={99}
                    w={60}
                    size="xs"
                  />
                )}
              </Group>
            </Paper>
          ))}
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => router.push('/order')}>
              Non, voir le catalogue
            </Button>
            <Button onClick={confirmRecommendations}>Commander ces produits</Button>
          </Group>
        </Stack>
      </Modal>
    </AppLayout>
  );
}
