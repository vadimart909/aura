#!/usr/bin/env node
/**
 * Генерирует clientAttributes.js из attributes.csv.
 *
 *   node shared/client-attributes/generate.mjs
 *
 * attributes.csv — источник истины (выгрузка атрибутов клиента, колонки
 * Category, CategroyDescription, Parameter, ParameterDescription, Type).
 * Текст берётся из CSV дословно; из правок — только те, что перечислены
 * в TYPO_FIXES, схлопывание повторных пробелов и заглавная первая буква
 * у названий категорий и параметров. Аббревиатуры (WB, Ozon, МКС, ML,
 * ОКВЭД) не трогаем.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(HERE, 'attributes.csv');
const OUT_PATH = path.join(HERE, 'clientAttributes.js');

/**
 * Порядок категорий в UI и их слаги. Слаги совпадают с теми, что уже
 * использовались в Scenario, — так дифф остаётся читаемым.
 * Ключ — название категории из CSV, приведённое через categoryKey().
 */
const CATEGORIES = [
  ['отрасль и стадия развития бизнеса', 'industry'],
  ['обслуживание компании в банке', 'bank_service'],
  ['операционная активность компании', 'operational_activity'],
  ['продукт корпоративная карта (покупки)', 'corp_card'],
  ['продукт платный документооборот', 'paid_docs'],
  ['продукт торговый дом вэд', 'trade_house'],
  ['формальная роль и полномочия', 'formal_role'],
  ['продукт калькулятор торговый дом', 'calc_trade_house'],
  ['продукт торговый эквайринг', 'trade_acquiring'],
  ['социально-демографический блок', 'socio_demographic'],
  ['структура портфеля фл', 'portfolio_fl'],
  ['поведенческие паттерны', 'behavioral_patterns'],
  ['коммуникационные предпочтения', 'communication_prefs'],
  ['продукт интернет-эквайринг (точка)', 'internet_acquiring'],
  ['продукт сбп qr', 'sbp_qr'],
  ['продукт подписка плюс', 'subscription_plus'],
  ['продукт онлайн-бухгалтерия', 'online_accounting'],
  ['продукт точка обороты', 'tochka_turnover'],
  ['селлеры', 'sellers'],
  ['комплаенс и блокировки', 'compliance'],
  ['финансовое здоровье', 'financial_health'],
  ['базовый административный профиль', 'admin_profile'],
  ['административные процессы', 'admin_processes'],
  ['активность и вовлеченность', 'engagement'],
  ['системные признаки событий', 'system_events'],
];

/**
 * Опечатки источника. Правки фразовые, а не по одному слову, — чтобы
 * случайно не задеть корректные вхождения того же слова в другом месте.
 * Каждая правка обязана сработать хотя бы раз, иначе генератор ругается:
 * значит, в CSV текст поменялся и правку пора убрать.
 */
const TYPO_FIXES = [
  ['обслживания', 'обслуживания'],
  ['зарегестрирован', 'зарегистрирован'],
  ['маркетплейсв', 'маркетплейсов'],
  ['кассы 2 в1 ,', 'кассы 2 в 1,'],
  ['клиенты персов', 'клиенты персон'],
  ['является резидентов рф', 'является резидентом рф'],
];

/** Разбирает CSV (RFC 4180: кавычки, запятые и переводы строк внутри полей). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch !== '"') field += ch;
      else if (text[i + 1] === '"') { field += '"'; i += 1; }
      else inQuotes = false;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Ключ для сопоставления названия категории из CSV со слагом. */
function categoryKey(raw) {
  return raw
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/:/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const fixesUsed = new Map(TYPO_FIXES.map(([from]) => [from, 0]));

/** Чистит текст из CSV: переносы, пробелы, опечатки. */
function clean(raw) {
  let s = String(raw).replace(/\\n/g, '\n');
  s = s
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .trim();
  for (const [from, to] of TYPO_FIXES) {
    if (s.includes(from)) {
      fixesUsed.set(from, fixesUsed.get(from) + 1);
      s = s.replaceAll(from, to);
    }
  }
  return s;
}

/** Заглавная первая буква; остальной регистр не трогаем. */
function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/* ---- Чтение и сборка ---- */

const [header, ...dataRows] = parseCsv(readFileSync(CSV_PATH, 'utf8'));
const col = Object.fromEntries(header.map((name, i) => [name.trim(), i]));
for (const name of ['Category', 'CategroyDescription', 'Parameter', 'ParameterDescription', 'Type']) {
  if (col[name] === undefined) throw new Error(`В attributes.csv нет колонки «${name}»`);
}

const slugByKey = new Map(CATEGORIES);
const categoryLabel = new Map();
const categoryDescription = new Map();
const byCategory = new Map(CATEGORIES.map(([, slug]) => [slug, []]));

for (const row of dataRows) {
  if (row.every((cell) => cell.trim() === '')) continue;

  const rawCategory = row[col.Category].trim();
  const slug = slugByKey.get(categoryKey(rawCategory));
  if (!slug) throw new Error(`Неизвестная категория «${rawCategory}» — добавь её в CATEGORIES`);

  if (!categoryLabel.has(slug)) {
    categoryLabel.set(slug, capitalize(clean(rawCategory)));
    categoryDescription.set(slug, capitalize(clean(row[col.CategroyDescription])));
  }

  byCategory.get(slug).push({
    title: capitalize(clean(row[col.Parameter])),
    description: capitalize(clean(row[col.ParameterDescription])),
    categoryId: slug,
    type: row[col.Type].trim().toLowerCase(),
  });
}

for (const [from, count] of fixesUsed) {
  if (count === 0) console.warn(`⚠  правка «${from}» ничего не нашла — проверь TYPO_FIXES`);
}

const attributes = [];
for (const [, slug] of CATEGORIES) {
  const items = byCategory.get(slug);
  if (items.length === 0) throw new Error(`У категории «${slug}» нет параметров`);
  items.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  for (const item of items) {
    attributes.push({ id: `attr_${attributes.length + 1}`, ...item });
  }
}

/* ---- Вывод ---- */

const q = (value) => JSON.stringify(value);
const lines = [];

lines.push('/**');
lines.push(' * Атрибуты клиента: категории и параметры для дроверов «Условие» (Scenario)');
lines.push(' * и «Параметр» (Segments).');
lines.push(' *');
lines.push(' * СГЕНЕРИРОВАНО из attributes.csv — руками не править.');
lines.push(' * Обновить: node shared/client-attributes/generate.mjs');
lines.push(' *');
lines.push(` * Категорий: ${CATEGORIES.length}. Параметров: ${attributes.length}.`);
lines.push(' */');
lines.push('');
lines.push('/** Категории параметров в порядке отображения. Без «Все» — это забота UI. */');
lines.push('export const ATTRIBUTE_CATEGORIES = [');
for (const [, slug] of CATEGORIES) {
  lines.push(
    `  { id: ${q(slug)}, label: ${q(categoryLabel.get(slug))}, description: ${q(categoryDescription.get(slug))} },`,
  );
}
lines.push('];');
lines.push('');
lines.push('/** Параметры. type — string | boolean | integer | number | date. */');
lines.push('export const ATTRIBUTES = [');
let currentCategory = null;
for (const attr of attributes) {
  if (attr.categoryId !== currentCategory) {
    currentCategory = attr.categoryId;
    lines.push(`  // ${categoryLabel.get(currentCategory)}`);
  }
  lines.push(
    `  { id: ${q(attr.id)}, title: ${q(attr.title)}, description: ${q(attr.description)}, categoryId: ${q(attr.categoryId)}, type: ${q(attr.type)} },`,
  );
}
lines.push('];');
lines.push('');

writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');

const types = {};
for (const attr of attributes) types[attr.type] = (types[attr.type] ?? 0) + 1;
console.log(`clientAttributes.js: ${CATEGORIES.length} категорий, ${attributes.length} параметров`);
console.log('типы:', Object.entries(types).map(([t, n]) => `${t} ${n}`).join(', '));
