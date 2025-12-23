'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconLock,
  IconMail,
  IconMapPin,
  IconMoon,
  IconPhone,
  IconSun,
  IconUser,
} from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import AppLayout from '@/components/AppLayout';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const profileForm = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
    },
    validate: {
      firstName: (value) => (value.length < 2 ? 'Prénom trop court' : null),
      lastName: (value) => (value.length < 2 ? 'Nom trop court' : null),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) =>
        value.length < 6 ? 'Le mot de passe doit faire au moins 6 caractères' : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Les mots de passe ne correspondent pas' : null,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        profileForm.setValues({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    const token = localStorage.getItem('token');
    setSubmitting(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        notifications.show({
          title: 'Profil mis à jour',
          message: 'Vos informations ont été enregistrées avec succès',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de mettre à jour le profil',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    const token = localStorage.getItem('token');
    setSubmitting(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profileForm.values,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Mot de passe modifié',
          message: 'Votre mot de passe a été mis à jour',
          color: 'green',
        });
        passwordForm.reset();
      } else {
        const err = await response.json();
        notifications.show({
          title: 'Erreur',
          message: err.error || 'Erreur lors du changement',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({ title: 'Erreur', message: 'Erreur réseau', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );

  return (
    <AppLayout user={user}>
      <Container size="md">
        <Stack gap="xl">
          <Title order={2}>Mon Profil</Title>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper withBorder p="xl" radius="md" h="100%">
                <Stack align="center" gap="md">
                  <Avatar size={100} radius={100} color="blue">
                    {user?.firstName[0]}
                    {user?.lastName[0]}
                  </Avatar>
                  <div style={{ textAlign: 'center' }}>
                    <Text size="lg" fw={700}>
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {user?.email}
                    </Text>
                    <Badge mt="xs" color={user?.role === 'ADMIN' ? 'red' : 'blue'}>
                      {user?.role === 'ADMIN' ? 'Administrateur' : 'Client'}
                    </Badge>
                  </div>

                  <Divider w="100%" />

                  <Stack gap="xs" w="100%">
                    <Group gap="sm">
                      <IconMail size={16} />
                      <Text size="xs">{user?.email}</Text>
                    </Group>
                    <Group gap="sm">
                      <IconPhone size={16} />
                      <Text size="xs">{user?.phone || 'Non renseigné'}</Text>
                    </Group>
                  </Stack>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Paper withBorder p="xl" radius="md">
                  <Title order={4} mb="lg">
                    <Group gap="xs">
                      <IconUser size={20} />
                      Informations Personnelles
                    </Group>
                  </Title>
                  <form onSubmit={profileForm.onSubmit(handleUpdateProfile)}>
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput label="Prénom" {...profileForm.getInputProps('firstName')} />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput label="Nom" {...profileForm.getInputProps('lastName')} />
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <TextInput
                          label="Téléphone"
                          leftSection={<IconPhone size={16} />}
                          {...profileForm.getInputProps('phone')}
                        />
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <TextInput
                          label="Adresse"
                          leftSection={<IconMapPin size={16} />}
                          {...profileForm.getInputProps('address')}
                        />
                      </Grid.Col>
                    </Grid>
                    <Button type="submit" mt="xl" loading={submitting}>
                      Enregistrer les modifications
                    </Button>
                  </form>
                </Paper>

                <Paper withBorder p="xl" radius="md">
                  <Title order={4} mb="lg">
                    <Group gap="xs">
                      <IconSun size={20} />
                      Préférences
                    </Group>
                  </Title>
                  <Stack gap="sm">
                    <Text size="sm" fw={500}>
                      Thème de l'application
                    </Text>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Passer du mode clair au mode sombre
                      </Text>
                      <Switch
                        size="lg"
                        onLabel={
                          <IconSun size={16} stroke={2.5} color="var(--mantine-color-yellow-4)" />
                        }
                        offLabel={
                          <IconMoon size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />
                        }
                        checked={computedColorScheme === 'dark'}
                        onChange={() =>
                          setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
                        }
                      />
                    </Group>
                  </Stack>
                </Paper>

                <Paper withBorder p="xl" radius="md">
                  <Title order={4} mb="lg">
                    <Group gap="xs">
                      <IconLock size={20} />
                      Sécurité
                    </Group>
                  </Title>
                  <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
                    <Stack gap="md">
                      <PasswordInput
                        label="Mot de passe actuel"
                        required
                        {...passwordForm.getInputProps('currentPassword')}
                      />
                      <PasswordInput
                        label="Nouveau mot de passe"
                        required
                        {...passwordForm.getInputProps('newPassword')}
                      />
                      <PasswordInput
                        label="Confirmer le nouveau mot de passe"
                        required
                        {...passwordForm.getInputProps('confirmPassword')}
                      />
                      <Button type="submit" color="orange" loading={submitting}>
                        Changer le mot de passe
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </AppLayout>
  );
}
