// jsdom has no ResizeObserver, and recharts' ResponsiveContainer needs one. Importing this file for its side effect
// gives chart tests a do-nothing version, so the components around a chart (legend, centre total, states) can be
// rendered and checked. jsdom has no layout, so the chart drawing itself is not asserted here.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverStub,
});
