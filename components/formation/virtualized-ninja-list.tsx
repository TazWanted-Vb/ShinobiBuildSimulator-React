"use client";

import { memo, useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Grid } from "react-window";
import { NinjaCard } from "./ninja-card";
import { Ninja } from "@/lib/types";
import { useMediaQuery } from "@/hooks/use-media-query";

interface VirtualizedNinjaListProps {
  ninjas: Ninja[];
  selectedNinjaId: number | null;
  usedNinjaIds: Set<number>;
  onSelectNinja: (id: number) => void;
}

const CARD_HEIGHT_MOBILE = 95;
const CARD_HEIGHT_DESKTOP = 90;
const CARD_GAP_MOBILE = 10;
const CARD_GAP_DESKTOP = 10;
const PADDING = 8;

// Type for the data passed to Grid cell component
interface GridCellData {
  ninjas: Ninja[];
  selectedNinjaId: number | null;
  usedNinjaIds: Set<number>;
  onSelectNinja: (id: number) => void;
  columnCount: number;
  columnWidth: number;
  cardHeight: number;
  gap: number;
}

// Props passed by react-window Grid to cell component
interface GridChildComponentProps<T = unknown> {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: T;
  isScrolling?: boolean;
}

function Cell({
  columnIndex,
  rowIndex,
  style,
  ninjas,
  selectedNinjaId,
  usedNinjaIds,
  onSelectNinja,
  columnCount,
  columnWidth,
  cardHeight,
  gap,
}: GridChildComponentProps<GridCellData> & GridCellData) {
  const index = rowIndex * columnCount + columnIndex;

  if (index >= ninjas.length) {
    return null;
  }

  const ninja = ninjas[index];

  // Add extra padding on left/right edges
  const isLeftColumn = columnIndex === 0;
  const isRightColumn = columnIndex === columnCount - 1;
  const sidePadding = 8;

  // Check if this is the last row
  const rowCount = Math.ceil(ninjas.length / columnCount);
  const isLastRow = rowIndex === rowCount - 1;

  return (
    <div
      style={{
        ...style,
        width: columnWidth,
        height: cardHeight,
        paddingTop: rowIndex === 0 ? sidePadding : gap / 2,
        paddingBottom: isLastRow ? sidePadding : gap / 2,
        paddingLeft: isLeftColumn ? sidePadding : gap / 2,
        paddingRight: isRightColumn ? sidePadding : gap / 2,
        boxSizing: 'border-box',
      }}
    >
      <NinjaCard
        ninja={ninja}
        isSelected={selectedNinjaId === ninja.id}
        isUsed={usedNinjaIds.has(ninja.id)}
        onSelect={onSelectNinja}
      />
    </div>
  );
}

const MemoizedCell = memo(Cell, (prevProps, nextProps) => {
  // Only re-render if the specific ninja for this cell changed
  const prevNinja = prevProps.ninjas[prevProps.rowIndex * prevProps.columnCount + prevProps.columnIndex];
  const nextNinja = nextProps.ninjas[nextProps.rowIndex * nextProps.columnCount + nextProps.columnIndex];

  // If either ninja is undefined (can happen during filtering), re-render
  if (!prevNinja || !nextNinja) return false;

  // If the ninja reference is the same and selection/usage status hasn't changed, skip re-render
  if (prevNinja !== nextNinja) return false;

  const prevSelected = prevProps.selectedNinjaId === prevNinja.id;
  const nextSelected = nextProps.selectedNinjaId === nextNinja.id;
  if (prevSelected !== nextSelected) return false;

  const prevUsed = prevProps.usedNinjaIds.has(prevNinja.id);
  const nextUsed = nextProps.usedNinjaIds.has(nextNinja.id);
  if (prevUsed !== nextUsed) return false;

  return true;
});

function VirtualizedNinjaListComponent({
  ninjas,
  selectedNinjaId,
  usedNinjaIds,
  onSelectNinja,
}: VirtualizedNinjaListProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const containerRef = useRef<HTMLDivElement>(null);
  // Grid ref type with scrollToCell method
  const gridRef = useRef<{ scrollToCell: (params: { rowIndex: number; columnIndex: number }) => void } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0); // Start with 0 to show loading state
  const [containerHeight, setContainerHeight] = useState(0);
  const [isReady, setIsReady] = useState(false); // Track if container size is initialized

  const layout = useMemo(() => {
    const cardHeight = isDesktop ? CARD_HEIGHT_DESKTOP : CARD_HEIGHT_MOBILE;
    const gap = isDesktop ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
    const columnCount = isDesktop ? 2 : 1;

    return {
      cardHeight,
      gap,
      columnCount,
    };
  }, [isDesktop]);

  const updateContainerSize = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      setContainerWidth(width);
      setContainerHeight(height);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    updateContainerSize();
  }, [updateContainerSize]);

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateContainerSize();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [updateContainerSize]);

  const { columnCount, cardHeight, gap } = layout;
  const rowCount = Math.ceil(ninjas.length / columnCount);
  const rowHeight = cardHeight + gap; // card height + gap
  const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount; // width without extra padding

  const cellProps = useMemo<GridCellData>(() => ({
    ninjas,
    selectedNinjaId,
    usedNinjaIds,
    onSelectNinja,
    columnCount,
    columnWidth,
    cardHeight,
    gap,
  }), [ninjas, selectedNinjaId, onSelectNinja, columnCount, columnWidth, cardHeight, gap, usedNinjaIds.size]);

  useEffect(() => {
    if (gridRef.current && ninjas.length === 0) {
      gridRef.current.scrollToCell({ rowIndex: 0, columnIndex: 0 });
    }
  }, [ninjas.length]);

  if (ninjas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
        No ninjas found
      </div>
    );
  }

  // Show loading state while container size is being calculated
  if (!isReady || containerWidth === 0) {
    return (
      <div ref={containerRef} className="h-full w-full overflow-hidden flex items-center justify-center">
        <div className="text-neutral-500 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={containerWidth}
        // @ts-expect-error - react-window types don't include cellComponent/cellProps but they exist at runtime
        cellComponent={MemoizedCell}
        cellProps={cellProps as any}
        overscanCount={2}
        style={{ overflowX: 'hidden' }}
      />
    </div>
  );
}

export const VirtualizedNinjaList = memo(VirtualizedNinjaListComponent);
VirtualizedNinjaList.displayName = 'VirtualizedNinjaList';
