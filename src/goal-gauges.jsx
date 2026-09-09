import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, ThemeProvider, Typography, createTheme } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const goals = [5000, 10000, 50000];
const septemberIndex = 8;
const thaiNumber = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 });
const thaiCurrency = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
});
const skipAnimation = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const theme = createTheme({
    typography: {
        fontFamily: '"Noto Sans Thai", "Leelawadee UI", system-ui, sans-serif',
    },
});

function GoalGauge({ goal, total }) {
    const value = Math.min(goal, Math.max(0, total));
    const percentage = (value / goal) * 100;
    const labelId = `goal-label-${goal}`;

    return (
        <Box
            sx={{
                display: 'grid',
                justifyItems: 'center',
                gap: 1,
                minWidth: 0,
                py: 1.5,
            }}
        >
            <Typography id={labelId} component="h3" sx={{ color: 'var(--ink)', fontSize: '0.9375rem', fontWeight: 700 }}>
                เป้าหมาย {thaiCurrency.format(goal)}
            </Typography>
            <Gauge
                width={164}
                height={132}
                value={value}
                valueMin={0}
                valueMax={goal}
                startAngle={-110}
                endAngle={110}
                innerRadius="74%"
                outerRadius="100%"
                cornerRadius="50%"
                skipAnimation={skipAnimation}
                aria-labelledby={labelId}
                aria-valuetext={`${thaiNumber.format(percentage)}% ของเป้าหมาย`}
                text={() => `${thaiNumber.format(percentage)}%`}
                sx={{
                    [`& .${gaugeClasses.valueArc}`]: { fill: 'var(--primary)' },
                    [`& .${gaugeClasses.referenceArc}`]: { fill: 'var(--line)' },
                    [`& .${gaugeClasses.valueText}`]: {
                        fill: 'var(--ink)',
                        fontSize: 22,
                        fontWeight: 700,
                    },
                }}
            />
        </Box>
    );
}

function getSeptemberTotal(stats) {
    if (!stats) return Number.NaN;

    const monthlyTotal = Number(stats?.monthly);
    if (Number.isFinite(monthlyTotal)) return monthlyTotal;

    return (stats?.chartData?.['30d'] ?? [])
        .filter(({ date }) => new Date(`${date}T00:00:00`).getMonth() === septemberIndex)
        .reduce((total, { amount }) => total + (Number(amount) || 0), 0);
}

function DonationGoals() {
    const [stats, setStats] = useState(window.__donationStats ?? null);
    const [hasError, setHasError] = useState(Boolean(window.__donationStatsError));

    useEffect(() => {
        const onReady = (event) => setStats(event.detail);
        const onError = () => setHasError(true);
        window.addEventListener('donation-stats-ready', onReady);
        window.addEventListener('donation-stats-error', onError);
        return () => {
            window.removeEventListener('donation-stats-ready', onReady);
            window.removeEventListener('donation-stats-error', onError);
        };
    }, []);

    const septemberTotal = getSeptemberTotal(stats);
    const ready = Number.isFinite(septemberTotal) && septemberTotal >= 0;
    const section = document.getElementById('donation-goals');
    section?.setAttribute('aria-busy', String(!ready && !hasError));
    section?.classList.toggle('is-error', hasError || (stats !== null && !ready));

    if (hasError || (stats !== null && !ready)) {
        return <Typography sx={{ mt: 1, color: 'var(--error)', fontSize: '0.875rem' }}>ไม่สามารถอ่านยอดโดเนทเดือนกันยายนได้</Typography>;
    }

    if (!ready) {
        return <Typography sx={{ mt: 1, color: 'var(--muted)', fontSize: '0.875rem' }}>กำลังโหลดยอดโดเนทเดือนกันยายน</Typography>;
    }

    return (
        <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                ยอดโดเนทเดือนกันยายน {thaiCurrency.format(septemberTotal)}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1, mt: 1 }}>
                {goals.map((goal) => <GoalGauge key={goal} goal={goal} total={septemberTotal} />)}
            </Box>
        </Box>
    );
}

createRoot(document.getElementById('goal-gauges-root')).render(
    <ThemeProvider theme={theme}>
        <DonationGoals />
    </ThemeProvider>,
);
