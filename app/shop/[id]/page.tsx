'use client';

import dayjs from 'dayjs';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconAlertCircle,
  IconBuildingStore,
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
  Radio,
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
  category: {
    id: string;
    name: string;
  } | null;
  price: number;
  priceUnit: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  shopId: string;
  options?: {
    id: string;
    name: string;
    isRequired: boolean;
    values: {
      id: string;
      name: string;
      priceModifier: number;
      priceMultiplier: number;
    }[];
  }[];
}

interface CartItem extends Omit<Product, 'options'> {
  quantity: number;
  selectedOptions?: {
    optionName: string;
    valueName: string;
    priceModifier: number;
  }[];
  finalUnitPrice: number;
}

interface Shop {
  id: string;
  name: string;
  description: string | null;
}

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderModalOpened, setOrderModalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempOptions, setTempOptions] = useState<Record<string, string>>({});
  const [optionsModalOpened, setOptionsModalOpened] = useState(false);

  // Charger l'utilisateur
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    if (userStr) setUser(JSON.parse(userStr));
  }, [router]);

  // Charger le panier
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

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Charger les infos de livraison
  useEffect(() => {
    const info = getNextDeliveryInfo();
    setDeliveryInfo(info);
    const interval = setInterval(() => setDeliveryInfo(getNextDeliveryInfo()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Charger la boutique et les produits
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Charger les boutiques pour trouver la nôtre
      const shopsRes = await fetch('/api/shops');
      const allShops = await shopsRes.json();
      const currentShop = allShops.find((s: Shop) => s.id === id);
      setShop(currentShop);

      // Charger les produits
      const productsRes = await fetch('/api/products');
      const allProducts = await productsRes.json();
      // Filtrer par boutique
      setProducts(allProducts.filter((p: Product) => p.shopId === id));
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger les données',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, selectedOpts: Record<string, string> = {}) => {
    // Calculer le prix final : (prix * multiplicateur) + modificateur
    let totalMultiplier = 1;
    let totalModifier = 0;
    const itemOptions = [];

    if (product.options) {
      for (const opt of product.options) {
        const valName = selectedOpts[opt.id];
        const val = opt.values.find((v) => v.name === valName);
        if (val) {
          totalMultiplier *= val.priceMultiplier || 1;
          totalModifier += val.priceModifier || 0;
          itemOptions.push({
            optionName: opt.name,
            valueName: val.name,
            priceModifier: val.priceModifier,
            priceMultiplier: val.priceMultiplier || 1,
          });
        }
      }
    }

    const finalUnitPrice = product.price * totalMultiplier + totalModifier;
    const cartId = `${product.id}-${JSON.stringify(itemOptions)}`;

    const existingItem = cart.find(
      (item) => `${item.id}-${JSON.stringify(item.selectedOptions)}` === cartId
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          `${item.id}-${JSON.stringify(item.selectedOptions)}` === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const { options, ...productRest } = product;
      setCart([
        ...cart,
        {
          ...productRest,
          quantity: 1,
          selectedOptions: itemOptions,
          finalUnitPrice,
        },
      ]);
    }

    notifications.show({
      title: 'Ajouté au panier',
      message: `${product.name} ajouté au panier`,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
    setOptionsModalOpened(false);
  };

  const handleAddClick = (product: Product) => {
    if (product.options && product.options.length > 0) {
      setSelectedProduct(product);
      // Pré-remplir avec les premières valeurs
      const initial: Record<string, string> = {};
      product.options.forEach((opt) => {
        initial[opt.id] = opt.values[0].name;
      });
      setTempOptions(initial);
      setOptionsModalOpened(true);
    } else {
      addToCart(product);
    }
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(
        cart.filter((item) => `${item.id}-${JSON.stringify(item.selectedOptions)}` !== cartId)
      );
      return;
    }
    setCart(
      cart.map((item) =>
        `${item.id}-${JSON.stringify(item.selectedOptions)}` === cartId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.finalUnitPrice * item.quantity, 0);
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
            // On concatène les options dans les notes pour le moment,
            // ou on pourrait étendre OrderItem
            notes: item.selectedOptions?.map((o) => `${o.optionName}: ${o.valueName}`).join(', '),
            unitPrice: item.finalUnitPrice,
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
        const err = await response.json();
        notifications.show({ title: 'Erreur', message: err.error || 'Erreur', color: 'red' });
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
      <AppLayout user={user}>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </AppLayout>
    );
  }

  if (!shop) {
    return (
      <AppLayout user={user}>
        <Container>
          <Alert color="red">Boutique introuvable</Alert>
        </Container>
      </AppLayout>
    );
  }

  // Grouper par catégorie pour l'affichage
  const categories = Array.from(new Set(products.map((p) => p.category?.name || 'Autres')));

  return (
    <AppLayout user={user}>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* ... existing header ... */}
          <Paper shadow="sm" p="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Title order={1} mb="xs">
                    🏪 {shop.name}
                  </Title>
                  <Text c="dimmed">{shop.description}</Text>
                </div>
                <Paper p="md" withBorder radius="md" bg="blue.0">
                  <Text size="sm" fw={700} c="blue">
                    Prochaine livraison
                  </Text>
                  <Text size="lg" fw={800}>
                    {formatDeliveryDate(deliveryInfo.deliveryDate)}
                  </Text>
                </Paper>
              </Group>

              {!deliveryInfo.isOrderOpen && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Commandes fermées"
                  color="orange"
                >
                  La période de commande pour cette livraison est terminée.
                </Alert>
              )}
            </Stack>
          </Paper>

          {/* Panier ... */}
          {cart.length > 0 && (
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <IconShoppingCart size={24} />
                  <Title order={3}>Votre Panier ({cart.length})</Title>
                </Group>
                <Button
                  onClick={() => setOrderModalOpened(true)}
                  disabled={!deliveryInfo.isOrderOpen}
                  size="lg"
                  leftSection={<IconCheck size={20} />}
                  color="green"
                >
                  Commander ({getTotalAmount().toFixed(2)} €)
                </Button>
              </Group>
              <Stack gap="xs">
                {cart.map((item) => {
                  const cartId = `${item.id}-${JSON.stringify(item.selectedOptions)}`;
                  return (
                    <Group
                      key={cartId}
                      justify="space-between"
                      p="sm"
                      style={{ borderRadius: 8, background: 'var(--mantine-color-gray-0)' }}
                    >
                      <div>
                        <Text fw={500}>{item.name}</Text>
                        {item.selectedOptions?.map((so, idx) => (
                          <Text key={idx} size="xs" c="dimmed">
                            {so.optionName}: {so.valueName}
                          </Text>
                        ))}
                      </div>
                      <Group gap="md">
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            onClick={() => updateQuantity(cartId, item.quantity - 1)}
                          >
                            <IconMinus size={16} />
                          </ActionIcon>
                          <Text fw={700} w={30} ta="center">
                            {item.quantity}
                          </Text>
                          <ActionIcon
                            variant="light"
                            onClick={() => updateQuantity(cartId, item.quantity + 1)}
                          >
                            <IconPlus size={16} />
                          </ActionIcon>
                        </Group>
                        <Text fw={700} w={80} ta="right">
                          {(item.finalUnitPrice * item.quantity).toFixed(2)} €
                        </Text>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => updateQuantity(cartId, 0)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  );
                })}
              </Stack>
            </Paper>
          )}

          {categories.map((categoryName) => (
            <div key={categoryName}>
              <Title order={2} mb="md" style={{ textTransform: 'capitalize' }}>
                {categoryName.toLowerCase()}
              </Title>
              <Grid>
                {products
                  .filter((p) => (p.category?.name || 'Autres') === categoryName && p.isAvailable)
                  .map((product) => (
                    <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                      <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                        <Card.Section>
                          <Image
                            src={product.imageUrl || ''}
                            height={160}
                            alt={product.name}
                            fallbackSrc={`https://placehold.co/400x300/e9ecef/495057?text=${product.name}`}
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
                            <div>
                              <Text fw={700} size="xl" c="blue" mb={-5}>
                                {product.price.toFixed(2)} €
                              </Text>
                              {product.priceUnit && (
                                <Text size="xs" c="dimmed">
                                  {product.priceUnit}
                                </Text>
                              )}
                            </div>
                            <Button
                              onClick={() => handleAddClick(product)}
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
          ))}
        </Stack>
      </Container>

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
            <Group
              key={`${item.id}-${JSON.stringify(item.selectedOptions)}`}
              justify="space-between"
            >
              <div>
                <Text>
                  {item.name} x {item.quantity}
                </Text>
                {item.selectedOptions?.map((so, idx) => (
                  <Text key={idx} size="xs" c="dimmed">
                    {so.optionName}: {so.valueName}
                  </Text>
                ))}
              </div>
              <Text fw={700}>{(item.finalUnitPrice * item.quantity).toFixed(2)} €</Text>
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

      <OptionsModal
        opened={optionsModalOpened}
        onClose={() => setOptionsModalOpened(false)}
        product={selectedProduct}
        values={tempOptions}
        setValues={setTempOptions}
        onAdd={addToCart}
      />
    </AppLayout>
  );
}

function OptionsModal({
  opened,
  onClose,
  product,
  values,
  setValues,
  onAdd,
}: {
  opened: boolean;
  onClose: () => void;
  product: Product | null;
  values: Record<string, string>;
  setValues: (v: Record<string, string>) => void;
  onAdd: (product: Product, values: Record<string, string>) => void;
}) {
  if (!product) return null;

  const currentPriceInfo = Object.entries(values).reduce(
    (acc, [optId, valName]) => {
      const opt = product.options?.find((o) => o.id === optId);
      const val = opt?.values.find((v) => v.name === valName);
      return {
        multiplier: acc.multiplier * (val?.priceMultiplier || 1),
        modifier: acc.modifier + (val?.priceModifier || 0),
      };
    },
    { multiplier: 1, modifier: 0 }
  );

  const currentTotalPrice = product.price * currentPriceInfo.multiplier + currentPriceInfo.modifier;

  return (
    <Modal opened={opened} onClose={onClose} title={`Options pour ${product.name}`} size="md">
      <Stack gap="md">
        {product.options?.map((opt) => (
          <div key={opt.id}>
            <Text fw={600} mb={5}>
              {opt.name}
            </Text>
            <Radio.Group
              value={values[opt.id]}
              onChange={(val) => setValues({ ...values, [opt.id]: val })}
            >
              <Stack gap="xs">
                {opt.values.map((val) => (
                  <Radio
                    key={val.id}
                    value={val.name}
                    label={
                      <Group justify="space-between" style={{ width: '100%' }}>
                        <Text size="sm">{val.name}</Text>
                        <Group gap={5}>
                          {val.priceMultiplier !== 1 && (
                            <Badge size="xs" color="grape" variant="outline">
                              x{val.priceMultiplier}
                            </Badge>
                          )}
                          {val.priceModifier !== 0 && (
                            <Badge size="xs" color={val.priceModifier > 0 ? 'green' : 'red'}>
                              {val.priceModifier > 0 ? '+' : ''}
                              {val.priceModifier.toFixed(2)} €
                            </Badge>
                          )}
                        </Group>
                      </Group>
                    }
                  />
                ))}
              </Stack>
            </Radio.Group>
          </div>
        ))}

        <Divider mt="md" />

        <Group justify="space-between">
          <Text fw={700} size="lg">
            Prix total
          </Text>
          <Text fw={700} size="lg" c="blue">
            {currentTotalPrice.toFixed(2)} €
          </Text>
        </Group>

        <Button fullWidth onClick={() => onAdd(product, values)} color="blue" size="md">
          Ajouter au panier
        </Button>
      </Stack>
    </Modal>
  );
}
