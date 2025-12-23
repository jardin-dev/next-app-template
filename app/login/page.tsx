'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconAlertCircle, IconBread } from '@tabler/icons-react';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email invalide'),
      password: (value) =>
        value.length >= 6 ? null : 'Le mot de passe doit contenir au moins 6 caractères',
      firstName: (value) => (isRegister && !value ? 'Prénom requis' : null),
      lastName: (value) => (isRegister && !value ? 'Nom requis' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      if (isRegister) {
        // Après l'inscription, basculer vers la connexion
        setIsRegister(false);
        form.reset();
        setError('');
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      } else {
        // Après la connexion, sauvegarder le token et rediriger
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Rediriger selon le rôle
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/shops');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Container size={460}>
        <Paper radius="md" p="xl" withBorder shadow="xl">
          <Center mb="xl">
            <Group gap="xs">
              <IconBread size={48} stroke={1.5} />
              <div>
                <Title order={1} size="h2">
                  Dépôt de Pain
                </Title>
                <Text size="sm" c="dimmed">
                  Votre boulangerie locale
                </Text>
              </div>
            </Group>
          </Center>

          <Title order={2} ta="center" mb="md">
            {isRegister ? 'Créer un compte' : 'Connexion'}
          </Title>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {isRegister && (
                <>
                  <Group grow>
                    <TextInput
                      label="Prénom"
                      placeholder="Jean"
                      required
                      {...form.getInputProps('firstName')}
                    />
                    <TextInput
                      label="Nom"
                      placeholder="Dupont"
                      required
                      {...form.getInputProps('lastName')}
                    />
                  </Group>
                  <TextInput
                    label="Téléphone"
                    placeholder="06 12 34 56 78"
                    {...form.getInputProps('phone')}
                  />
                  <TextInput
                    label="Adresse"
                    placeholder="123 Rue de la Boulangerie"
                    {...form.getInputProps('address')}
                  />
                </>
              )}

              <TextInput
                label="Email"
                placeholder="votre@email.com"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Mot de passe"
                placeholder="Votre mot de passe"
                required
                {...form.getInputProps('password')}
              />

              <Button type="submit" fullWidth mt="md" size="lg" loading={loading}>
                {isRegister ? "S'inscrire" : 'Se connecter'}
              </Button>
            </Stack>
          </form>

          <Divider label="ou" labelPosition="center" my="lg" />

          <Text ta="center" size="sm">
            {isRegister ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}{' '}
            <Anchor
              component="button"
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                form.reset();
              }}
              fw={700}
            >
              {isRegister ? 'Se connecter' : "S'inscrire"}
            </Anchor>
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}
