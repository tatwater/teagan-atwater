import { useCallback, useLayoutEffect, useRef, useState } from 'react';


/** Matches the `gap-1` between pills, in pixels. */
const GAP = 4;

/**
 * Item widths are fractional, so a row whose rounded widths sum to exactly the
 * container's still wraps. Everything here is measured with
 * `getBoundingClientRect`, and this covers what's left.
 */
const EPSILON = 1;


/**
 * How many of a wrapping row's items fit on its first line, leaving room for a
 * trailing control when some are left over.
 *
 * Clipping with `overflow: hidden` is the obvious way to hold a row to one line
 * and it puts the trailing control in the wrong place: the row fills its
 * container, so the control parks at the far right with a gap after the last
 * visible item. Rendering only what fits lets the control sit inline directly
 * after it instead.
 *
 * `count` is `null` until the first measurement, which is the caller's cue to
 * render everything so there is something to measure. The pass runs in a layout
 * effect, before the browser paints, so the full row is never visible.
 *
 * Widths are cached from that pass because they do not change with the
 * container, which lets a resize re-fit without re-rendering the full row.
 */
export function useSingleLineFit(options: {
  /** Number of items in the row, excluding the trailing control. */
  itemCount: number;
  /**
   * Changes whenever the row's contents change, including a reorder. Cached
   * widths are positional, so a reorder invalidates them just as surely as a
   * different set of items would.
   */
  resetKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const itemWidths = useRef<number[]>([]);
  const controlWidth = useRef(0);
  const [count, setCount] = useState<number | null>(null);
  const lastKey = useRef(options.resetKey);

  // Drop back to measuring when the row changes underneath us. Adjusting state
  // during render is the supported way to do this: React re-renders
  // immediately, before the browser paints, so the full row never shows.
  if (lastKey.current !== options.resetKey) {
    lastKey.current = options.resetKey;
    itemWidths.current = [];
    setCount(null);
  }

  const compute = useCallback((available: number, itemCount: number) => {
    const widths = itemWidths.current;

    // An empty row has nothing to measure, and nothing to measure would
    // otherwise leave it in the measuring state forever — still rendering the
    // reserved-space control that only exists to be measured.
    if (itemCount === 0) return 0;

    if (widths.length === 0 || available === 0) return null;

    const total = widths.reduce((sum, w) => sum + w, 0) + GAP * (widths.length - 1);

    // Everything fits, so no control is needed and no room is kept for one.
    if (total <= available - EPSILON) return widths.length;

    const budget = available - controlWidth.current - GAP - EPSILON;
    let used = 0;
    let fitted = 0;

    for (const width of widths) {
      const next = fitted === 0 ? width : used + GAP + width;

      if (next > budget) break;

      used = next;
      fitted += 1;
    }

    // Never drop to nothing: one item plus a large count still reads.
    return Math.max(1, fitted);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];

    // More children than items means every item is mounted *and* the trailing
    // control is with them — the one arrangement that can be measured, since
    // the control's width is part of the budget. Any other arrangement is a
    // partial row, which would poison the cache.
    if (children.length > options.itemCount) {
      itemWidths.current = children
        .slice(0, options.itemCount)
        .map((child) => child.getBoundingClientRect().width);
      controlWidth.current = children[options.itemCount].getBoundingClientRect().width;
    }

    const apply = () => {
      const next = compute(el.getBoundingClientRect().width, options.itemCount);

      if (next !== null) setCount((prev) => (prev === next ? prev : next));
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);

    return () => observer.disconnect();
  }, [compute, options.itemCount, options.resetKey]);

  return { count, ref };
}
