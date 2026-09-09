'use client';
import { useLocale } from '@/components/locale-provider';
import Link from 'next/link';
export default function NotFound() { const { t, link } = useLocale(); return <main id="main" className="not-found"><div className="eyebrow" style={{ justifyContent: 'center' }}>{t("404 / HALAMAN TIDAK DITEMUKAN")}</div><h1>{t("Mari kembali ke jalur yang tepat.")}</h1><p className="muted">{t("Halaman ini belum tersedia atau alamatnya telah berubah.")}</p><Link href={link("/produk")} className="btn btn-dark">{t("Jelajahi produk biomassa")}</Link></main>; }
