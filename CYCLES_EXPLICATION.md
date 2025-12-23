# 📅 Système de Cycles de Livraison - Explication Visuelle

## 🔄 Les Deux Cycles

### CYCLE 1 : Samedi → Mercredi

```
┌─────────────────────────────────────────────────────────────┐
│  SAMEDI (Jour de commande)                                  │
│  ↓                                                           │
│  Dimanche, Lundi, Mardi (Commandes ouvertes)                │
│  ↓                                                           │
│  MERCREDI (Livraison) 🚚                                    │
└─────────────────────────────────────────────────────────────┘
```

### CYCLE 2 : Mercredi → Samedi

```
┌─────────────────────────────────────────────────────────────┐
│  MERCREDI (Jour de commande)                                │
│  ↓                                                           │
│  Jeudi, Vendredi (Commandes ouvertes)                       │
│  ↓                                                           │
│  SAMEDI (Livraison) 🚚                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📆 Calendrier Exemple (Décembre 2024)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        DÉCEMBRE 2024                                     │
├────────┬────────┬────────┬────────┬────────┬────────┬────────────────────┤
│  Lun   │  Mar   │  Mer   │  Jeu   │  Ven   │  Sam   │  Dim              │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────────┤
│        │        │        │        │        │        │   1               │
│        │        │        │        │        │        │   CYCLE_1         │
│        │        │        │        │        │        │   → Mer 4         │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────────┤
│   2    │   3    │   4    │   5    │   6    │   7    │   8               │
│ C1→M4  │ C1→M4  │ 🚚 LIV │ C2→S7  │ C2→S7  │ 🚚 LIV │  CYCLE_1          │
│        │        │ CYCLE_2│        │        │ CYCLE_1│  → Mer 11         │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────────┤
│   9    │  10    │  11    │  12    │  13    │  14    │  15               │
│ C1→M11 │ C1→M11 │ 🚚 LIV │ C2→S14 │ C2→S14 │ 🚚 LIV │  CYCLE_1          │
│        │        │ CYCLE_2│        │        │ CYCLE_1│  → Mer 18         │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────────┤
│  16    │  17    │  18    │  19    │  20    │  21    │  22               │
│ C1→M18 │ C1→M18 │ 🚚 LIV │ C2→S21 │ C2→S21 │ 🚚 LIV │  CYCLE_1          │
│        │        │ CYCLE_2│        │        │ CYCLE_1│  → Mer 25         │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────────┤
│  23    │  24    │  25    │  26    │  27    │  28    │  29               │
│ C1→M25 │ C1→M25 │ 🚚 LIV │ C2→S28 │ C2→S28 │ 🚚 LIV │  CYCLE_1          │
│        │        │ CYCLE_2│        │        │ CYCLE_1│  → Mer 1/1        │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────────┤
│  30    │  31    │        │        │        │        │                   │
│ C1→M1  │ C1→M1  │        │        │        │        │                   │
└────────┴────────┴────────┴────────┴────────┴────────┴────────────────────┘

Légende :
🚚 LIV    = Jour de livraison
C1→M25    = CYCLE_1, livraison Mercredi 25
C2→S28    = CYCLE_2, livraison Samedi 28
```

## 🕐 Timeline d'une Semaine Type

```
SEMAINE TYPE
═══════════════════════════════════════════════════════════════

SAMEDI (Jour J)
├─ 00:00 → Ouverture CYCLE_1 (pour livraison Mercredi J+4)
├─ 23:59 → Fermeture CYCLE_1
└─ Deadline : Samedi 23h59

DIMANCHE (J+1)
├─ Commandes CYCLE_1 ouvertes
└─ Livraison : Mercredi J+3

LUNDI (J+2)
├─ Commandes CYCLE_1 ouvertes
└─ Livraison : Mercredi J+2

MARDI (J+3)
├─ Commandes CYCLE_1 ouvertes
└─ Livraison : Mercredi J+1

MERCREDI (J+4)
├─ 00:00 → Ouverture CYCLE_2 (pour livraison Samedi J+3)
├─ 🚚 LIVRAISON CYCLE_1
├─ 23:59 → Fermeture CYCLE_2
└─ Deadline : Mercredi 23h59

JEUDI (J+5)
├─ Commandes CYCLE_2 ouvertes
└─ Livraison : Samedi J+2

VENDREDI (J+6)
├─ Commandes CYCLE_2 ouvertes
└─ Livraison : Samedi J+1

SAMEDI (J+7)
├─ 🚚 LIVRAISON CYCLE_2
├─ 00:00 → Ouverture CYCLE_1 (nouveau cycle)
└─ Le cycle recommence...
```

## 🎯 Exemples Concrets

### Exemple 1 : Commande le Lundi 23 Décembre

```
Aujourd'hui : Lundi 23 décembre 2024

┌─────────────────────────────────────────────────────────┐
│  Informations de Livraison                              │
├─────────────────────────────────────────────────────────┤
│  Cycle actuel      : CYCLE_1                            │
│  Livraison         : Mercredi 25 décembre 2024          │
│  Deadline          : Samedi 21 décembre 23h59           │
│  Jours restants    : 2 jours                            │
│  Statut            : ✅ Commandes ouvertes              │
└─────────────────────────────────────────────────────────┘
```

### Exemple 2 : Commande le Jeudi 26 Décembre

```
Aujourd'hui : Jeudi 26 décembre 2024

┌─────────────────────────────────────────────────────────┐
│  Informations de Livraison                              │
├─────────────────────────────────────────────────────────┤
│  Cycle actuel      : CYCLE_2                            │
│  Livraison         : Samedi 28 décembre 2024            │
│  Deadline          : Mercredi 25 décembre 23h59         │
│  Jours restants    : 2 jours                            │
│  Statut            : ✅ Commandes ouvertes              │
└─────────────────────────────────────────────────────────┘
```

### Exemple 3 : Après la Deadline

```
Aujourd'hui : Dimanche 22 décembre 2024 (après 23h59 samedi)

┌─────────────────────────────────────────────────────────┐
│  Informations de Livraison                              │
├─────────────────────────────────────────────────────────┤
│  Cycle actuel      : CYCLE_2                            │
│  Livraison         : Samedi 28 décembre 2024            │
│  Deadline          : Mercredi 25 décembre 23h59         │
│  Jours restants    : 6 jours                            │
│  Statut            : ⚠️ Deadline passée, cycle suivant  │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Logique de Calcul

### Algorithme Simplifié

```
SI aujourd'hui = Dimanche, Lundi ou Mardi
  ALORS
    Cycle = CYCLE_1
    Livraison = Mercredi de cette semaine
    Deadline = Samedi précédent

SI aujourd'hui = Mercredi
  ALORS
    Cycle = CYCLE_2
    Livraison = Samedi de cette semaine
    Deadline = Mercredi (aujourd'hui) 23h59

SI aujourd'hui = Jeudi ou Vendredi
  ALORS
    Cycle = CYCLE_2
    Livraison = Samedi de cette semaine
    Deadline = Mercredi de cette semaine

SI aujourd'hui = Samedi
  ALORS
    Cycle = CYCLE_1
    Livraison = Mercredi de la semaine prochaine
    Deadline = Samedi (aujourd'hui) 23h59

SI deadline dépassée
  ALORS
    Passer au cycle suivant
```

## 📊 Tableau Récapitulatif

| Jour Actuel | Cycle   | Livraison      | Deadline     | Jours Avant Livraison |
| ----------- | ------- | -------------- | ------------ | --------------------- |
| Dimanche    | CYCLE_1 | Mercredi (S)   | Samedi (S-1) | 3                     |
| Lundi       | CYCLE_1 | Mercredi (S)   | Samedi (S-1) | 2                     |
| Mardi       | CYCLE_1 | Mercredi (S)   | Samedi (S-1) | 1                     |
| Mercredi    | CYCLE_2 | Samedi (S)     | Mercredi (S) | 3                     |
| Jeudi       | CYCLE_2 | Samedi (S)     | Mercredi (S) | 2                     |
| Vendredi    | CYCLE_2 | Samedi (S)     | Mercredi (S) | 1                     |
| Samedi      | CYCLE_1 | Mercredi (S+1) | Samedi (S)   | 4                     |

_S = Semaine actuelle, S-1 = Semaine précédente, S+1 = Semaine suivante_

## 💡 Points Importants

### ✅ Avantages du Système

1. **Régularité** : 2 livraisons par semaine
2. **Prévisibilité** : Les clients savent toujours quand commander
3. **Flexibilité** : Deux opportunités de commande par semaine
4. **Organisation** : Le boulanger peut planifier sa production

### ⚠️ Points d'Attention

1. **Deadline stricte** : Après 23h59, impossible de commander pour ce cycle
2. **Calcul automatique** : Le système gère tout automatiquement
3. **Jours fériés** : À gérer manuellement si nécessaire
4. **Vacances** : Prévoir un système de fermeture temporaire

## 🛠️ Configuration

Pour modifier les cycles, éditez `lib/delivery-cycles.ts` :

```typescript
// Exemple : Changer les jours de livraison
// Actuellement : Mercredi (3) et Samedi (6)
// Pour changer : Modifier les valeurs day()

// CYCLE_1 : Samedi → Mardi (au lieu de Mercredi)
deliveryDate = now.day(2); // 2 = Mardi

// CYCLE_2 : Mardi → Vendredi (au lieu de Samedi)
deliveryDate = now.day(5); // 5 = Vendredi
```

## 📱 Affichage dans l'Application

L'interface affiche :

```
┌────────────────────────────────────────────────────────┐
│  Prochaine livraison                                   │
│  Mercredi 25 décembre 2024                             │
│                                                         │
│  🔵 Cycle Mercredi                                     │
│                                                         │
│  📅 Dans 2 jours                                       │
│  ⏰ Date limite : 21/12/2024 à 23:59                   │
│                                                         │
│  ✅ Commandes ouvertes                                 │
└────────────────────────────────────────────────────────┘
```

Ou si fermé :

```
┌────────────────────────────────────────────────────────┐
│  ⚠️ Commandes fermées                                  │
│                                                         │
│  La période de commande pour cette livraison est       │
│  terminée. La prochaine ouverture sera bientôt         │
│  disponible.                                            │
└────────────────────────────────────────────────────────┘
```

---

**Ce système garantit une organisation optimale pour votre dépôt de pain ! 🥖**
