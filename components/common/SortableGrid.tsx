"use client";

import { createContext, useContext, useId, type CSSProperties, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "./Button";

type SortableState = ReturnType<typeof useSortable>;

/** Trạng thái kéo của item hiện tại — chỉ có giá trị bên trong 1 item của SortableGrid. */
const SortableItemContext = createContext<SortableState | null>(null);

interface SortableGridProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** Gọi với mảng đã đổi chỗ sau khi thả — chỉ gọi khi thứ tự thật sự đổi. */
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => ReactNode;
  className?: string;
}

/**
 * Lưới kéo-thả đổi thứ tự (bọc @dnd-kit) — dùng cho layout dạng grid nhiều cột (rectSortingStrategy).
 * Chỉ kéo được từ `<SortableGridHandle>` đặt bên trong item (phần còn lại của item vẫn click bình thường, vd link).
 * Hỗ trợ cả bàn phím (focus tay nắm → Space để nhấc, mũi tên để di chuyển, Space để thả).
 */
export function SortableGrid<T>({ items, getId, onReorder, renderItem, className }: SortableGridProps<T>) {
  // id cố định giữa SSR và client — tránh lệch aria-describedby (hydration mismatch) của DndContext.
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((it) => getId(it) === active.id);
    const to = items.findIndex((it) => getId(it) === over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(getId)} strategy={rectSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableItem key={getId(item)} id={getId(item)}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const sortable = useSortable({ id });
  const { setNodeRef, transform, transition, isDragging } = sortable;
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <SortableItemContext.Provider value={sortable}>{children}</SortableItemContext.Provider>
    </div>
  );
}

/** Item hiện tại có đang bị kéo không — false nếu không nằm trong SortableGrid. */
export function useSortableItemDragging(): boolean {
  return useContext(SortableItemContext)?.isDragging ?? false;
}

interface SortableGridHandleProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

/** Tay nắm kéo (nút icon ghost) — đặt bên trong item của SortableGrid; ngoài SortableGrid thì không render gì. */
export function SortableGridHandle({ title, className = "", children }: SortableGridHandleProps) {
  const sortable = useContext(SortableItemContext);
  if (!sortable) return null;
  const { setActivatorNodeRef, attributes, listeners } = sortable;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      title={title}
      aria-label={title}
      className={`cursor-grab! touch-none active:cursor-grabbing! ${className}`}
    >
      {children}
    </Button>
  );
}
