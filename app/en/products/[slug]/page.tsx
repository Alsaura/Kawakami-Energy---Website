import Page from '@/components/pages/product-detail';
import {getProducts} from '@/lib/catalog';
import {canonicalProductSlug,pageMetadata} from '@/lib/i18n';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=getProducts('en').find(p=>p.slug===canonicalProductSlug(slug));return pageMetadata('en',p?`/produk/${p.slug}`:'/produk',p?`${p.name} — Kawakami Global Energy`:'Produk tidak ditemukan',p?.description);}
export default function ProductPage({params}:{params:Promise<{slug:string}>}){return <Page locale="en" params={params}/>;}
