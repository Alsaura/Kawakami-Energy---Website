import { getLocaleTools, type Locale } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProducts } from '@/lib/catalog';
import { ProductCard, Assurance, FAQ, Closing } from '@/components/sections';
export default function Products({ locale = 'id' }: {
    locale?: Locale;
} = {}) { const { t, link } = getLocaleTools(locale); const products = getProducts(locale); return <main id="main"><section className="page-intro shell"><div className="breadcrumb"><Link href={link("/")}>{t("Beranda")}</Link><ArrowRight size={13}/><span>{t("Produk")}</span></div><div className="page-intro-row"><div><div className="eyebrow">{t("PORTOFOLIO BIOMASSA")}</div><h1>{t("Bahan dari alam.")}<br /><em>{t("Potensi untuk masa depan.")}</em></h1></div><p>{t("Kenali karakter setiap material dan temukan pilihan yang sesuai dengan kebutuhan energi industri Anda.")}</p></div></section><section className="catalog-section shell"><div className="product-grid">{products.map(p => <ProductCard key={p.slug} product={p}/>)}</div><Assurance /></section><FAQ /><Closing /></main>; }
