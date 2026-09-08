export function formatRupiah(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return 'Rp 0';
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * Format compact currency e.g.:
 * 1.245.000.000 -> "Rp 1,25 M" (Miliar) atau "Rp 1.25B"
 * 851.387.496   -> "Rp 851,4 Jt" (Juta) atau "Rp 851.4M"
 * 500.000       -> "Rp 500 Rb" (Ribu) atau "Rp 500K"
 */
export function formatRupiahCompact(
    amount: number | string | null | undefined,
    style: 'id' | 'intl' = 'id'
): string {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return 'Rp 0';
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (style === 'intl') {
        if (abs >= 1_000_000_000_000) {
            return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, '')}T`;
        }
        if (abs >= 1_000_000_000) {
            return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
        }
        if (abs >= 1_000_000) {
            return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace(/\.?0+$/, '')}M`;
        }
        if (abs >= 1_000) {
            return `${sign}Rp ${(abs / 1_000).toFixed(0)}K`;
        }
        return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
    }

    // Indonesian standard business format: "Jt" (Juta), "M" (Miliar), "T" (Triliun), "Rb" (Ribu)
    if (abs >= 1_000_000_000_000) {
        return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')} T`;
    }
    if (abs >= 1_000_000_000) {
        return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')} M`;
    }
    if (abs >= 1_000_000) {
        return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace(/\.?0+$/, '').replace('.', ',')} Jt`;
    }
    if (abs >= 1_000) {
        return `${sign}Rp ${(abs / 1_000).toFixed(0)} Rb`;
    }
    return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}

/**
 * Format currency with compact lowercase Indonesian notation (k, jt, M, T)
 * Examples:
 * 101.500.000 -> "Rp 101,5 jt"
 * 85.750.000  -> "Rp 85,75 jt"
 * 15.750.000  -> "Rp 15,75 jt"
 * 500.000     -> "Rp 500 k"
 */
export function formatCurrencyShort(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return 'Rp 0';
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (abs >= 1_000_000_000_000) {
        const val = (abs / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
        return `${sign}Rp ${val} T`;
    }
    if (abs >= 1_000_000_000) {
        const val = (abs / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
        return `${sign}Rp ${val} M`;
    }
    if (abs >= 1_000_000) {
        const val = (abs / 1_000_000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
        return `${sign}Rp ${val} jt`;
    }
    if (abs >= 1_000) {
        const val = (abs / 1_000).toFixed(1).replace(/\.?0+$/, '').replace('.', ',');
        return `${sign}Rp ${val} k`;
    }
    return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}

export function formatNumber(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
        return '0';
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID').format(num);
}

export function formatNumberCompact(num: number | string | null | undefined): string {
    if (num === null || num === undefined || isNaN(Number(num))) return '0';
    const val = typeof num === 'string' ? parseFloat(num) : num;
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';

    if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${sign}${abs}`;
}

export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(date);
    } catch {
        return dateString;
    }
}
