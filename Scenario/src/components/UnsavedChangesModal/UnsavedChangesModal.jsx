import { Exit } from '@ds/icons';
import ConfirmDialog from '../ConfirmDialog';

/**
 * Modal: "Данные не сохранятся. Выйти?"
 *
 * A thin wrapper over ConfirmDialog that pins the copy and the destructive
 * tone, so the several call sites guarding the editing flow don't each repeat
 * the strings.
 *
 * @param {Object}   props
 * @param {Function} props.onExit   — callback when user confirms exit
 * @param {Function} props.onCancel — callback when user cancels (stays on page)
 */
export default function UnsavedChangesModal({ onExit, onCancel }) {
  return (
    <ConfirmDialog
      message="Данные не сохранятся. Выйти?"
      confirmLabel="Выйти без сохранения"
      confirmIcon={<Exit />}
      tone="error"
      onConfirm={onExit}
      onCancel={onCancel}
    />
  );
}
