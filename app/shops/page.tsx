'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconBuildingStore } from '@tabler/icons-react';
import {
  Button,
  Card,
  Center,
  Container,
  Grid,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import AppLayout from '@/components/AppLayout';

export default function ShopsSelectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    if (userStr) setUser(JSON.parse(userStr));

    fetch('/api/shops')
      .then((res) => res.json())
      .then((data) => {
        setShops(data.filter((s: any) => s.isActive));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  if (loading)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <AppLayout user={user}>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <div style={{ textAlign: 'center' }}>
            <Title order={1} mb="xs">
              Nos Boutiques Partenaires
            </Title>
            <Text c="dimmed" size="lg">
              Choisissez une boutique pour commencer vos provisions
            </Text>
          </div>

          <Grid gutter="xl">
            {shops.map((shop) => (
              <Grid.Col key={shop.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" p="xl" radius="md" withBorder h="100%">
                  <Card.Section>
                    <Image
                      src={shop.imageUrl || ''}
                      height={160}
                      fallbackSrc={`https://placehold.co/400x300/f8f9fa/adb5bd?text=${shop.name}`}
                      alt={shop.name}
                    />
                  </Card.Section>

                  <Stack mt="md" gap="sm" style={{ flex: 1 }}>
                    <Title order={3}>{shop.name}</Title>
                    <Text size="sm" c="dimmed" lineClamp={3}>
                      {shop.description || 'Découvrez nos produits frais de qualité.'}
                    </Text>

                    <Button
                      fullWidth
                      mt="auto"
                      onClick={() => router.push(`/shop/${shop.id}`)}
                      rightSection={<IconArrowRight size={16} />}
                      variant="light"
                      color="blue"
                    >
                      Voir le catalogue
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    </AppLayout>
  );
}
