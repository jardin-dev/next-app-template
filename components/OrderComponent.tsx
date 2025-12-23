'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
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
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
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

export default function OrderComponent() {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderModalOpened, setOrderModalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Charger le panier depuis le localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erreur chargement panier:', e);
      }
    }
  }, []);

  // Sauvegarder le panier dès qu'il change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Charger les informations de livraison
  useEffect(() => {
    const info = getNextDeliveryInfo();
    setDeliveryInfo(info);

    // Mettre à jour toutes les minutes
    const interval = setInterval(() => {
      const updatedInfo = getNextDeliveryInfo();
      setDeliveryInfo(updatedInfo);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Charger les produits
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
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
      title: 'Ajouté au panier',
      message: `${product.name} ajouté au panier`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

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
            unitPrice: item.price,
          })),
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Commande confirmée !',
          message: `Votre commande sera livrée le ${formatDeliveryDate(deliveryInfo.deliveryDate)}`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setCart([]);
        setOrderModalOpened(false);
      } else {
        throw new Error('Erreur lors de la commande');
      }
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de passer la commande',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !deliveryInfo) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const pains = products.filter((p) => p.category === 'PAIN' && p.isAvailable);
  const viennoiseries = products.filter((p) => p.category === 'VIENNOISERIE' && p.isAvailable);
  const autres = products.filter((p) => p.category === 'AUTRE' && p.isAvailable);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* En-tête avec informations de livraison */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={2} mb="xs">
                  Prochaine livraison
                </Title>
                <Text size="xl" fw={700} c="blue">
                  {formatDeliveryDate(deliveryInfo.deliveryDate)}
                </Text>
              </div>
              <Badge size="xl" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                {deliveryInfo.cycle === 'CYCLE_1' ? 'Cycle Mercredi' : 'Cycle Samedi'}
              </Badge>
            </Group>

            <Group gap="xl">
              <Group gap="xs">
                <IconCalendar size={20} />
                <Text size="sm">
                  Dans <strong>{deliveryInfo.daysUntilDelivery}</strong> jour
                  {deliveryInfo.daysUntilDelivery > 1 ? 's' : ''}
                </Text>
              </Group>
              <Group gap="xs">
                <IconClock size={20} />
                <Text size="sm">
                  Date limite :{' '}
                  <strong>{dayjs(deliveryInfo.orderDeadline).format('DD/MM/YYYY à HH:mm')}</strong>
                </Text>
              </Group>
            </Group>

            {!deliveryInfo.isOrderOpen && (
              <Alert icon={<IconAlertCircle size={16} />} title="Commandes fermées" color="orange">
                La période de commande pour cette livraison est terminée. La prochaine ouverture
                sera bientôt disponible.
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Panier */}
        {cart.length > 0 && (
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconShoppingCart size={24} />
                <Title order={3}>Panier ({cart.length})</Title>
              </Group>
              <Button
                onClick={() => setOrderModalOpened(true)}
                disabled={!deliveryInfo.isOrderOpen}
                size="lg"
                leftSection={<IconCheck size={20} />}
              >
                Commander ({getTotalAmount().toFixed(2)} €)
              </Button>
            </Group>
            <Stack gap="xs">
              {cart.map((item) => (
                <Group
                  key={item.id}
                  justify="space-between"
                  p="sm"
                  style={{ borderRadius: 8, background: '#f8f9fa' }}
                >
                  <Text fw={500}>{item.name}</Text>
                  <Group gap="md">
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <IconMinus size={16} />
                      </ActionIcon>
                      <Text fw={700} w={30} ta="center">
                        {item.quantity}
                      </Text>
                      <ActionIcon
                        variant="light"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                    <Text fw={700} w={80} ta="right">
                      {(item.price * item.quantity).toFixed(2)} €
                    </Text>
                    <ActionIcon color="red" variant="light" onClick={() => removeFromCart(item.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Catalogue Pains */}
        <div>
          <Title order={2} mb="md">
            Pains
          </Title>
          <Grid>
            {pains.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Card.Section>
                    <Image
                      src={product.imageUrl || '/placeholder-bread.jpg'}
                      height={160}
                      alt={product.name}
                      fallbackSrc="https://placehold.co/400x300/e9ecef/495057?text=Pain"
                    />
                  </Card.Section>

                  <Stack gap="xs" mt="md" style={{ flex: 1 }}>
                    <Text fw={600} size="lg">
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {product.description}
                      </Text>
                    )}
                    <Group justify="space-between" mt="auto">
                      <Text fw={700} size="xl" c="blue">
                        {product.price.toFixed(2)} €
                      </Text>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={!deliveryInfo.isOrderOpen}
                        leftSection={<IconPlus size={16} />}
                      >
                        Ajouter
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>

        {/* Catalogue Viennoiseries */}
        <div>
          <Title order={2} mb="md">
            Viennoiseries
          </Title>
          <Grid>
            {viennoiseries.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Card.Section>
                    <Image
                      src={product.imageUrl || '/placeholder-pastry.jpg'}
                      height={160}
                      alt={product.name}
                      fallbackSrc="https://placehold.co/400x300/fff3e0/f57c00?text=Viennoiserie"
                    />
                  </Card.Section>

                  <Stack gap="xs" mt="md" style={{ flex: 1 }}>
                    <Text fw={600} size="lg">
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {product.description}
                      </Text>
                    )}
                    <Group justify="space-between" mt="auto">
                      <Text fw={700} size="xl" c="orange">
                        {product.price.toFixed(2)} €
                      </Text>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={!deliveryInfo.isOrderOpen}
                        color="orange"
                        leftSection={<IconPlus size={16} />}
                      >
                        Ajouter
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>
      </Stack>

      {/* Modal de confirmation */}
      <Modal
        opened={orderModalOpened}
        onClose={() => setOrderModalOpened(false)}
        title="Confirmer votre commande"
        size="lg"
      >
        <Stack gap="md">
          <Alert icon={<IconCalendar size={16} />} color="blue">
            Livraison prévue le <strong>{formatDeliveryDate(deliveryInfo.deliveryDate)}</strong>
          </Alert>

          <Divider label="Récapitulatif" labelPosition="center" />

          {cart.map((item) => (
            <Group key={item.id} justify="space-between">
              <Text>
                {item.name} x {item.quantity}
              </Text>
              <Text fw={700}>{(item.price * item.quantity).toFixed(2)} €</Text>
            </Group>
          ))}

          <Divider />

          <Group justify="space-between">
            <Text size="xl" fw={700}>
              Total
            </Text>
            <Text size="xl" fw={700} c="blue">
              {getTotalAmount().toFixed(2)} €
            </Text>
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setOrderModalOpened(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitOrder}
              loading={submitting}
              leftSection={<IconCheck size={16} />}
            >
              Confirmer la commande
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
