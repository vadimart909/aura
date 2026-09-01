/**
 * Условия для ConditionModal — адаптер общего списка атрибутов клиента
 * (shared/client-attributes) под форму, которую ждёт модалка.
 *
 * Сами данные править здесь нельзя: источник — shared/client-attributes/attributes.csv,
 * пересборка — node shared/client-attributes/generate.mjs.
 */

import { ATTRIBUTE_CATEGORIES, ATTRIBUTES } from '@shared/client-attributes/clientAttributes';

/** Категории для фильтрации параметров. «Все» — синтетическая, только для UI. */
export const CONDITION_CATEGORIES = [
  { value: 'all', label: 'Все', description: '' },
  ...ATTRIBUTE_CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
    description: category.description,
  })),
];

/** Параметры условий, привязанные к категориям. */
export const CONDITION_PARAMETERS = ATTRIBUTES.map((attribute) => ({
  id: attribute.id,
  title: attribute.title,
  description: attribute.description,
  category: attribute.categoryId,
  type: attribute.type,
}));
