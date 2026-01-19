import React, { lazy, Suspense } from 'react';

// Lazy load all Recharts components
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const Pie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const Area = lazy(() => import('recharts').then(module => ({ default: module.Area })));
const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));

// Chart loading component
const ChartLoader = () => (
    <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-400">Loading chart...</div>
    </div>
);

// Export wrapped components
export const LazyPieChart = (props: any) => (
    <Suspense fallback={<ChartLoader />}>
        <PieChart {...props} />
    </Suspense>
);

export const LazyPie = (props: any) => (
    <Suspense fallback={null}>
        <Pie {...props} />
    </Suspense>
);

export const LazyCell = (props: any) => (
    <Suspense fallback={null}>
        <Cell {...props} />
    </Suspense>
);

export const LazyResponsiveContainer = (props: any) => (
    <Suspense fallback={<ChartLoader />}>
        <ResponsiveContainer {...props} />
    </Suspense>
);

export const LazyLegend = (props: any) => (
    <Suspense fallback={null}>
        <Legend {...props} />
    </Suspense>
);

export const LazyTooltip = (props: any) => (
    <Suspense fallback={null}>
        <Tooltip {...props} />
    </Suspense>
);

export const LazyBarChart = (props: any) => (
    <Suspense fallback={<ChartLoader />}>
        <BarChart {...props} />
    </Suspense>
);

export const LazyBar = (props: any) => (
    <Suspense fallback={null}>
        <Bar {...props} />
    </Suspense>
);

export const LazyXAxis = (props: any) => (
    <Suspense fallback={null}>
        <XAxis {...props} />
    </Suspense>
);

export const LazyYAxis = (props: any) => (
    <Suspense fallback={null}>
        <YAxis {...props} />
    </Suspense>
);

export const LazyCartesianGrid = (props: any) => (
    <Suspense fallback={null}>
        <CartesianGrid {...props} />
    </Suspense>
);

export const LazyLineChart = (props: any) => (
    <Suspense fallback={<ChartLoader />}>
        <LineChart {...props} />
    </Suspense>
);

export const LazyLine = (props: any) => (
    <Suspense fallback={null}>
        <Line {...props} />
    </Suspense>
);

export const LazyArea = (props: any) => (
    <Suspense fallback={null}>
        <Area {...props} />
    </Suspense>
);

export const LazyAreaChart = (props: any) => (
    <Suspense fallback={<ChartLoader />}>
        <AreaChart {...props} />
    </Suspense>
);

// Re-export directly for components that need them synchronously
export { 
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
    Area,
    AreaChart
};