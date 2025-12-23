'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconBread,
  IconBuildingStore,
  IconClipboardList,
  IconDashboard,
  IconHistory,
  IconLogout,
  IconMoon,
  IconPackage,
  IconShoppingCart,
  IconSun,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Group,
  Image,
  Menu,
  NavLink,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'CLIENT';
  } | null;
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    // Supprimer le token
    localStorage.removeItem('token');
    router.push('/login');
  };

  const [shops, setShops] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/shops')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShops(data);
        }
      })
      .catch((err) => console.error('Error fetching shops for nav:', err));
  }, []);

  const clientNavItems = [
    { icon: IconBuildingStore, label: 'Boutiques', href: '/shops' },
    ...shops.map((shop) => ({
      icon: shop.name === 'Boulangerie' ? IconBread : IconBuildingStore,
      label: shop.name,
      href: `/shop/${shop.id}`,
    })),
    { icon: IconHistory, label: 'Mes commandes', href: '/my-orders' },
    { icon: IconUser, label: 'Mon profil', href: '/profile' },
  ];

  const adminNavItems = [
    { icon: IconDashboard, label: 'Tableau de bord', href: '/admin' },
    { icon: IconPackage, label: 'Produits', href: '/admin/products' },
    { icon: IconBuildingStore, label: 'Boutiques', href: '/admin/shops' },
    { icon: IconClipboardList, label: 'Commandes', href: '/admin/orders' },
    { icon: IconUsers, label: 'Utilisateurs', href: '/admin/users' },
  ];

  const navItems = pathname.startsWith('/admin') ? adminNavItems : clientNavItems;

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group wrap="nowrap" gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap={8} wrap="nowrap">
              <Box visibleFrom="xs">
                <Image src="/logo.svg" alt="Logo" h={30} w="auto" />
              </Box>
              <div>
                <Text size="md" fw={800} style={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
                  Dépôt de Pain
                </Text>
                <Text size="xs" c="dimmed" visibleFrom="sm">
                  Votre boulangerie locale
                </Text>
              </div>
            </Group>
          </Group>

          <Group gap="xs">
            {user?.role === 'ADMIN' && (
              <Button
                variant="light"
                color={pathname.startsWith('/admin') ? 'blue' : 'red'}
                size="xs"
                px="xs"
                leftSection={
                  pathname.startsWith('/admin') ? (
                    <IconShoppingCart size={14} />
                  ) : (
                    <IconDashboard size={14} />
                  )
                }
                onClick={() => router.push(pathname.startsWith('/admin') ? '/shops' : '/admin')}
              >
                <Text size="xs" visibleFrom="xs">
                  {pathname.startsWith('/admin') ? 'Boutique' : 'Admin'}
                </Text>
              </Button>
            )}

            {user && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Group style={{ cursor: 'pointer' }} gap={6}>
                    <Avatar color="blue" radius="xl" size="sm">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                    <Box visibleFrom="sm">
                      {/*<Text size="xs" fw={700} style={{ lineHeight: 1.1 }}>
                        {user.firstName}
                      </Text>
                      <Badge
                        size="xs"
                        variant="light"
                        color={user.role === 'ADMIN' ? 'red' : 'blue'}
                        p={4}
                        h={16}
                      >
                         {user.role === 'ADMIN' ? 'Admin' : 'Client'} 
                      </Badge>*/}
                    </Box>
                  </Group>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Mon compte</Menu.Label>
                  <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => router.push('/profile')}
                  >
                    Profil
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              active={pathname === item.href}
              onClick={() => {
                router.push(item.href);
                close();
              }}
              variant="subtle"
              mb="xs"
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Text size="xs" c="dimmed" ta="center">
            © 2024 Dépôt de Pain
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
