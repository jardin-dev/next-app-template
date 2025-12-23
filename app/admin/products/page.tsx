'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Autocomplete,
  Badge,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/components/AppLayout';

export default function AdminProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      categoryName: '',
      price: 1.0,
      priceUnit: 'unitaire',
      stock: 100,
      isAvailable: true,
      shopId: '',
      options: [] as {
        name: string;
        isRequired: boolean;
        values: { name: string; priceModifier: number; priceMultiplier: number }[];
      }[],
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Le nom est trop court' : null),
      categoryName: (value) => (!value ? 'Catégorie requise' : null),
      price: (value) => (value <= 0 ? 'Le prix doit être positif' : null),
      shopId: (value) => (!value ? 'Boutique requise' : null),
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
    fetchProducts();
    fetchShops();
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shops');
      if (response.ok) {
        const data = await response.json();
        setShops(data);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    const token = localStorage.getItem('token');
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
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
          message: editingId ? 'Produit mis à jour' : 'Produit créé',
          color: 'green',
        });
        setModalOpened(false);
        setEditingId(null);
        form.reset();
        fetchProducts();
        fetchCategories(); // Rafraîchir les catégories après création
      } else {
        const error = await response.json();
        notifications.show({ title: 'Erreur', message: error.error, color: 'red' });
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Erreur réseau', color: 'red' });
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    form.setValues({
      name: product.name,
      description: product.description || '',
      categoryName: product.category?.name || '',
      price: product.price,
      priceUnit: product.priceUnit || 'unitaire',
      stock: product.stock || 100,
      isAvailable: product.isAvailable,
      shopId: product.shopId || '',
      options:
        product.options?.map((opt: any) => ({
          name: opt.name,
          isRequired: opt.isRequired,
          values: opt.values.map((val: any) => ({
            name: val.name,
            priceModifier: val.priceModifier,
            priceMultiplier: val.priceMultiplier || 1,
          })),
        })) || [],
    });
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer/désactiver ce produit ?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        notifications.show({ title: 'Succès', message: 'Action effectuée', color: 'green' });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && products.length === 0)
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
            <Title order={2}>Gestion du Catalogue</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingId(null);
                form.reset();
                setModalOpened(true);
              }}
              color="orange"
            >
              Nouveau Produit
            </Button>
          </Group>

          <Paper withBorder p="md" radius="md">
            <TextInput
              placeholder="Rechercher un produit..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              mb="md"
            />

            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nom</Table.Th>
                  <Table.Th>Boutique</Table.Th>
                  <Table.Th>Catégorie</Table.Th>
                  <Table.Th ta="right">Prix</Table.Th>
                  <Table.Th ta="center">Dispo</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredProducts.map((product) => (
                  <Table.Tr key={product.id}>
                    <Table.Td>
                      <Text fw={500}>{product.name}</Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {product.description}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {product.shop?.name || 'Inconnue'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light" color="blue">
                        {product.category?.name || 'Sans catégorie'}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right">
                      {product.price.toFixed(2)} €
                      <Text size="xs" c="dimmed">
                        {product.priceUnit}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Badge color={product.isAvailable ? 'green' : 'red'} variant="dot">
                        {product.isAvailable ? 'OUI' : 'NON'}
                      </Badge>
                      {product.options?.length > 0 && (
                        <Tooltip label={`${product.options.length} options disponibles`}>
                          <Badge size="xs" variant="light" color="grape" ml={5}>
                            +{product.options.length} opt.
                          </Badge>
                        </Tooltip>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEdit(product)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(product.id)}
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
          title={editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}
          size="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput label="Nom du produit" required {...form.getInputProps('name')} />
              <TextInput label="Description" {...form.getInputProps('description')} />
              <Autocomplete
                label="Catégorie"
                placeholder="Sélectionnez ou créez une catégorie"
                data={categories.map((c) => c.name)}
                required
                {...form.getInputProps('categoryName')}
              />
              <Select
                label="Boutique"
                placeholder="Sélectionnez une boutique"
                data={shops.map((s) => ({ value: s.id, label: s.name }))}
                required
                {...form.getInputProps('shopId')}
              />
              <Group grow align="flex-start">
                <NumberInput
                  label="Prix (€)"
                  min={0.1}
                  step={0.1}
                  decimalScale={2}
                  required
                  {...form.getInputProps('price')}
                />
                <Autocomplete
                  label="Unité"
                  placeholder="unitaire, au kg..."
                  data={['unitaire', 'au kg', 'le lot', 'les 500g']}
                  {...form.getInputProps('priceUnit')}
                />
                <NumberInput label="Stock par défaut" min={1} {...form.getInputProps('stock')} />
              </Group>
              <Switch
                label="Rendre disponible à la vente"
                {...form.getInputProps('isAvailable', { type: 'checkbox' })}
              />

              <Divider label="Options du produit" labelPosition="center" />

              <Stack gap="xs">
                {form.values.options.map((option, index) => (
                  <Paper key={index} withBorder p="sm" radius="md">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <TextInput
                          placeholder="Nom de l'option (ex: Taille, Couleur)"
                          style={{ flex: 1 }}
                          {...form.getInputProps(`options.${index}.name`)}
                        />
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => {
                            const newOptions = [...form.values.options];
                            newOptions.splice(index, 1);
                            form.setFieldValue('options', newOptions);
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>

                      <Stack gap={5} pl="md">
                        {option.values.map((_, vIndex) => (
                          <Group key={vIndex} gap="xs">
                            <TextInput
                              placeholder="Valeur (ex: XL, Rouge)"
                              size="xs"
                              style={{ flex: 1 }}
                              {...form.getInputProps(`options.${index}.values.${vIndex}.name`)}
                            />
                            <NumberInput
                              placeholder="+/- €"
                              size="xs"
                              w={60}
                              step={0.1}
                              decimalScale={2}
                              {...form.getInputProps(
                                `options.${index}.values.${vIndex}.priceModifier`
                              )}
                            />
                            <NumberInput
                              placeholder="x coéff"
                              size="xs"
                              w={60}
                              step={0.1}
                              min={0}
                              decimalScale={2}
                              {...form.getInputProps(
                                `options.${index}.values.${vIndex}.priceMultiplier`
                              )}
                            />
                            <ActionIcon
                              size="xs"
                              color="red"
                              variant="subtle"
                              onClick={() => {
                                const newOptions = [...form.values.options];
                                newOptions[index].values.splice(vIndex, 1);
                                form.setFieldValue('options', newOptions);
                              }}
                            >
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Group>
                        ))}
                        <Button
                          variant="subtle"
                          size="compact-xs"
                          leftSection={<IconPlus size={10} />}
                          onClick={() => {
                            const newOptions = [...form.values.options];
                            newOptions[index].values.push({
                              name: '',
                              priceModifier: 0,
                              priceMultiplier: 1,
                            });
                            form.setFieldValue('options', newOptions);
                          }}
                        >
                          Ajouter une valeur
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => {
                    form.setFieldValue('options', [
                      ...form.values.options,
                      {
                        name: '',
                        isRequired: false,
                        values: [{ name: '', priceModifier: 0, priceMultiplier: 1 }],
                      },
                    ]);
                  }}
                >
                  Ajouter une option (Style, Poids...)
                </Button>
              </Stack>

              <Button type="submit" fullWidth color="orange" mt="md">
                {editingId ? 'Enregistrer' : 'Créer le produit'}
              </Button>
            </Stack>
          </form>
        </Modal>
      </Container>
    </AppLayout>
  );
}
