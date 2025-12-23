'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconClock,
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconTrash,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/components/AppLayout';
import { DeliveryInfo, formatDeliveryDate, getNextDeliveryInfo } from '@/lib/delivery-cycles';

import 'dayjs/locale/fr';

dayjs.locale('fr');

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: 'PAIN' | 'VIENNOISERIE' | 'AUTRE';
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

export default function OthersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [orderModalOpened, setOrderModalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }

    setDeliveryInfo(getNextDeliveryInfo());
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.filter((p: Product) => p.category === 'AUTRE' && p.isAvailable));
      }
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger les produits',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    notifications.show({
      title: 'Ajouté',
      message: `${product.name} ajouté au panier`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId));
      return;
    }
    setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)));
  };

  const getTotalAmount = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!deliveryInfo || cart.length === 0) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deliveryCycle: deliveryInfo.cycle,
          deliveryDate: deliveryInfo.deliveryDate,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Commande confirmée !',
          message: `Livraison le ${formatDeliveryDate(deliveryInfo.deliveryDate)}`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setCart([]);
        setOrderModalOpened(false);
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Échec de la commande', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !deliveryInfo)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <AppLayout user={user}>
      <Container size="xl">
        <Stack gap="xl">
          <Paper shadow="sm" p="xl" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Title order={2}>Nos autres produits</Title>
                <Text c="dimmed">Épicerie fine, miels et produits locaux</Text>
              </div>
              <Badge size="xl" color="teal" variant="light">
                {formatDeliveryDate(deliveryInfo.deliveryDate)}
              </Badge>
            </Group>
          </Paper>

          {cart.length > 0 && (
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              withBorder
              style={{ borderLeft: '4px solid var(--mantine-color-teal-filled)' }}
            >
              <Group justify="space-between">
                <Group>
                  <IconShoppingCart size={24} color="teal" />
                  <Title order={3}>Votre panier ({cart.length})</Title>
                </Group>
                <Button
                  color="teal"
                  onClick={() => setOrderModalOpened(true)}
                  disabled={!deliveryInfo.isOrderOpen}
                >
                  Valider la commande ({getTotalAmount().toFixed(2)} €)
                </Button>
              </Group>
              <Stack gap="xs" mt="md">
                {cart.map((item) => (
                  <Group
                    key={item.id}
                    justify="space-between"
                    p="xs"
                    style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}
                  >
                    <Text fw={500} size="sm">
                      {item.name}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <IconMinus size={14} />
                      </ActionIcon>
                      <Text fw={700} size="sm">
                        {item.quantity}
                      </Text>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <IconPlus size={14} />
                      </ActionIcon>
                      <Text fw={700} w={60} ta="right" size="sm">
                        {(item.price * item.quantity).toFixed(2)} €
                      </Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Paper>
          )}

          <Grid>
            {products.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Card.Section>
                    <Image
                      src={
                        product.imageUrl ||
                        'https://placehold.co/400x300/f1f3f5/adb5bd?text=Produit'
                      }
                      height={160}
                      alt={product.name}
                    />
                  </Card.Section>
                  <Stack gap="xs" mt="md" style={{ flex: 1 }}>
                    <Text fw={600} size="lg">
                      {product.name}
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {product.description}
                    </Text>
                    <Group justify="space-between" mt="auto">
                      <Text fw={700} size="xl" c="teal">
                        {product.price.toFixed(2)} €
                      </Text>
                      <Button
                        color="teal"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => addToCart(product)}
                        disabled={!deliveryInfo.isOrderOpen}
                      >
                        Ajouter
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
            {products.length === 0 && (
              <Grid.Col span={12}>
                <Center py={100}>
                  <Stack align="center" gap="xs">
                    <Text c="dimmed">
                      Aucun produit disponible dans cette catégorie pour le moment.
                    </Text>
                    <Button variant="light" onClick={() => router.push('/order')}>
                      Retourner aux pains
                    </Button>
                  </Stack>
                </Center>
              </Grid.Col>
            )}
          </Grid>
        </Stack>

        <Modal
          opened={orderModalOpened}
          onClose={() => setOrderModalOpened(false)}
          title="Confirmer votre commande"
          size="lg"
        >
          <Stack gap="md">
            <Alert icon={<IconCalendar size={16} />} color="teal">
              Livraison prévue le {formatDeliveryDate(deliveryInfo.deliveryDate)}
            </Alert>
            <Divider label="Récapitulatif" labelPosition="center" />
            {cart.map((item) => (
              <Group key={item.id} justify="space-between">
                <Text size="sm">
                  {item.name} x {item.quantity}
                </Text>
                <Text size="sm" fw={700}>
                  {(item.price * item.quantity).toFixed(2)} €
                </Text>
              </Group>
            ))}
            <Divider />
            <Group justify="space-between">
              <Text fw={700} size="lg">
                Total
              </Text>
              <Text fw={700} size="lg" c="teal">
                {getTotalAmount().toFixed(2)} €
              </Text>
            </Group>
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setOrderModalOpened(false)}>
                Annuler
              </Button>
              <Button color="teal" onClick={handleSubmitOrder} loading={submitting}>
                Confirmer la commande
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </AppLayout>
  );
}
