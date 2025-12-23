import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);

export enum DeliveryCycle {
  CYCLE_1 = 'CYCLE_1', // Commande samedi -> Livraison mercredi
  CYCLE_2 = 'CYCLE_2', // Commande mercredi -> Livraison samedi
}

export interface DeliveryInfo {
  cycle: DeliveryCycle;
  deliveryDate: Date;
  orderDeadline: Date;
  daysUntilDelivery: number;
  isOrderOpen: boolean;
}

/**
 * Calcule la prochaine date de livraison en fonction de la date actuelle
 *
 * Règles :
 * - CYCLE_1 : Commande le samedi pour livraison le mercredi suivant
 * - CYCLE_2 : Commande le mercredi pour livraison le samedi suivant
 *
 * Les commandes doivent être passées AVANT le jour de commande (samedi ou mercredi)
 */
export function getNextDeliveryInfo(currentDate: Date = new Date()): DeliveryInfo {
  const now = dayjs(currentDate);
  const dayOfWeek = now.day(); // 0 = Dimanche, 3 = Mercredi, 6 = Samedi

  let cycle: DeliveryCycle;
  let deliveryDate: Dayjs;
  let orderDeadline: Dayjs;

  // Logique de détermination du cycle et des dates
  if (dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2) {
    // Dimanche, Lundi, Mardi -> Prochaine livraison : Mercredi de cette semaine
    cycle = DeliveryCycle.CYCLE_1;
    deliveryDate = now.day(3); // Mercredi de cette semaine
    orderDeadline = now.day(-1); // Samedi précédent
  } else if (dayOfWeek === 3) {
    // Mercredi -> Prochaine livraison : Samedi de cette semaine
    cycle = DeliveryCycle.CYCLE_2;
    deliveryDate = now.day(6); // Samedi de cette semaine
    orderDeadline = now.startOf('day'); // Aujourd'hui (mercredi) jusqu'à minuit
  } else if (dayOfWeek === 4 || dayOfWeek === 5) {
    // Jeudi, Vendredi -> Prochaine livraison : Samedi de cette semaine
    cycle = DeliveryCycle.CYCLE_2;
    deliveryDate = now.day(6); // Samedi de cette semaine
    orderDeadline = now.day(3); // Mercredi de cette semaine
  } else {
    // Samedi (6)
    cycle = DeliveryCycle.CYCLE_1;
    deliveryDate = now.add(1, 'week').day(3); // Mercredi de la semaine prochaine
    orderDeadline = now.startOf('day'); // Aujourd'hui (samedi) jusqu'à minuit
  }

  // Vérifier si la commande est encore ouverte
  const isOrderOpen = now.isBefore(orderDeadline.endOf('day'));

  // Si la deadline est dépassée, passer au cycle suivant
  if (!isOrderOpen) {
    if (cycle === DeliveryCycle.CYCLE_1) {
      // Passer au CYCLE_2
      cycle = DeliveryCycle.CYCLE_2;
      deliveryDate = now.day(6); // Samedi de cette semaine
      if (dayOfWeek === 6) {
        deliveryDate = now.add(1, 'week').day(6); // Samedi prochain si on est samedi
      }
      orderDeadline = now.day(3); // Mercredi
      if (dayOfWeek >= 3) {
        orderDeadline = now.add(1, 'week').day(3); // Mercredi prochain
      }
    } else {
      // Passer au CYCLE_1 de la semaine suivante
      cycle = DeliveryCycle.CYCLE_1;
      deliveryDate = now.add(1, 'week').day(3); // Mercredi prochain
      orderDeadline = now.day(6); // Samedi
      if (dayOfWeek < 6) {
        orderDeadline = now.add(1, 'week').day(6); // Samedi prochain
      }
    }
  }

  const daysUntilDelivery = deliveryDate.diff(now, 'day');

  return {
    cycle,
    deliveryDate: deliveryDate.toDate(),
    orderDeadline: orderDeadline.endOf('day').toDate(),
    daysUntilDelivery,
    isOrderOpen: now.isBefore(orderDeadline.endOf('day')),
  };
}

/**
 * Calcule la date de livraison pour un cycle spécifique à partir d'une date de commande
 */
export function calculateDeliveryDate(orderDate: Date, cycle: DeliveryCycle): Date {
  const order = dayjs(orderDate);

  if (cycle === DeliveryCycle.CYCLE_1) {
    // Trouver le prochain mercredi
    const dayOfWeek = order.day();
    if (dayOfWeek <= 3) {
      return order.day(3).toDate(); // Mercredi de cette semaine
    } else {
      return order.add(1, 'week').day(3).toDate(); // Mercredi prochain
    }
  } else {
    // CYCLE_2 - Trouver le prochain samedi
    const dayOfWeek = order.day();
    if (dayOfWeek <= 6) {
      return order.day(6).toDate(); // Samedi de cette semaine
    } else {
      return order.add(1, 'week').day(6).toDate(); // Samedi prochain
    }
  }
}

/**
 * Formate une date de livraison pour l'affichage
 */
export function formatDeliveryDate(date: Date): string {
  return dayjs(date).format('dddd D MMMM YYYY');
}

/**
 * Obtient toutes les commandes groupées par date de livraison
 */
export function getDeliveryDates(startDate: Date, numberOfWeeks: number = 4): Date[] {
  const dates: Date[] = [];
  const start = dayjs(startDate);

  for (let i = 0; i < numberOfWeeks * 2; i++) {
    const weekOffset = Math.floor(i / 2);
    const isCycle1 = i % 2 === 0;

    if (isCycle1) {
      // Mercredi
      dates.push(start.add(weekOffset, 'week').day(3).toDate());
    } else {
      // Samedi
      dates.push(start.add(weekOffset, 'week').day(6).toDate());
    }
  }

  return dates;
}
