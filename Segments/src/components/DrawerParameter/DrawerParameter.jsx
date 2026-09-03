import { useEffect, useState } from 'react';
import { ATTRIBUTE_CATEGORIES, ATTRIBUTES } from '@shared/client-attributes/clientAttributes';
import { Drawer } from '@ds/components/Drawer';
import { DrawerHeader } from '@ds/components/Drawer';
import { DrawerFooter } from '@ds/components/Drawer';
import { Dropdown } from '@ds/components/Dropdown';
import { Cell } from '@ds/components/Cell';
import './DrawerParameter.css';

/* ---- Category and parameter data ----
 *
 * Общий список атрибутов клиента: источник — shared/client-attributes/attributes.csv,
 * пересборка — node shared/client-attributes/generate.mjs. Тот же список показывает
 * дровер «Условие» в Scenario. Здесь только адаптация под форму дровера — { id, name,
 * description }; править данные надо в CSV, а не тут.
 */

const PARAMETERS_BY_CATEGORY = {};
for (const attribute of ATTRIBUTES) {
  const list = PARAMETERS_BY_CATEGORY[attribute.categoryId] ?? [];
  list.push({ id: attribute.id, name: attribute.title, description: attribute.description });
  PARAMETERS_BY_CATEGORY[attribute.categoryId] = list;
}

/** Get parameters for a given category. «Все» aggregates all categories. */
function getParametersForCategory(categoryId) {
  if (categoryId === 'all') {
    return Object.values(PARAMETERS_BY_CATEGORY)
      .flat()
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'ru'));
  }
  return PARAMETERS_BY_CATEGORY[categoryId] || [];
}

/* ---- Category list: «Все» + категории из общего списка ---- */

const CATEGORIES = [
  { id: 'all', name: 'Все', description: null },
  ...ATTRIBUTE_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.label,
    description: category.description || null,
  })),
];

/**
 * DrawerParameter — правый боковой drawer для добавления нового параметра.
 *
 * Props:
 *   isOpen     — открыт ли drawer
 *   onClose    — колбэк закрытия drawer
 *   onAdd      — колбэк добавления параметра ({ category, parameter })
 */
export default function DrawerParameter({ isOpen, onClose, onAdd }) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedParam, setSelectedParam] = useState(null);
  const [paramSearch, setParamSearch] = useState('');

  // Drawer живёт постоянно (иначе ДС не проиграет анимацию открытия), поэтому
  // сбрасываем выбор сами — раньше это делал размонтаж.
  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategory(CATEGORIES[0]);
    setSelectedParam(null);
    setParamSearch('');
  }, [isOpen]);

  const availableParams = getParametersForCategory(selectedCategory.id);
  const filteredParams = paramSearch
    ? availableParams.filter((p) => p.name.toLowerCase().includes(paramSearch.toLowerCase()))
    : availableParams;

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    /* Reset parameter when category changes */
    setSelectedParam(null);
    setParamSearch('');
  };

  const handleAdd = () => {
    onAdd?.({ category: selectedCategory, parameter: selectedParam });
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={<DrawerHeader title="Новый параметр" onClose={onClose} />}
      footer={
        <DrawerFooter
          layout="1-button"
          primaryAction={{ label: 'Добавить', onClick: handleAdd }}
        />
      }
    >
      <div className="drawer-param__content">
        {/* Dropdown: Категория. `value` — подпись, а не id: по ней DropdownPopup
            сам находит выбранный пункт и ставит галочку. */}
        <Dropdown
          label="Категория"
          value={selectedCategory.name}
          description={selectedCategory.description || undefined}
        >
          {CATEGORIES.map((cat) => (
            <Cell
              key={cat.id}
              title={cat.name}
              description={cat.description || undefined}
              hasLeftAccessory={false}
              onClick={() => handleCategorySelect(cat)}
            />
          ))}
        </Dropdown>

        {/* Dropdown: Параметр (с поиском) */}
        <Dropdown
          label="Параметр"
          value={selectedParam?.name}
          placeholder="Введи название или выбери из списка"
          description={selectedParam?.description || undefined}
          hasSearch
          searchPlaceholder="Введи название"
          onSearchChange={setParamSearch}
          isEmpty={filteredParams.length === 0}
          emptyText={paramSearch ? 'Ничего не найдено' : 'Нет параметров для выбранной категории'}
        >
          {filteredParams.map((param) => (
            <Cell
              key={param.id}
              title={param.name}
              description={param.description || undefined}
              hasLeftAccessory={false}
              onClick={() => setSelectedParam(param)}
            />
          ))}
        </Dropdown>
      </div>
    </Drawer>
  );
}
