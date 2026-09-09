'use client';
import { useLocale, useInquiryCache, type InquiryDraft as Draft } from '@/components/locale-provider';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CONTACT, getProducts } from '@/lib/catalog';
const blank: Draft = { name: '', company: '', email: '', phone: '', product: '', volume: '', location: '', date: '', message: '', documents: '' };
type ModelContext = {
    registerTool: (tool: {
        name: string;
        title: string;
        description: string;
        inputSchema: object;
        annotations: {
            readOnlyHint: boolean;
        };
        execute: (input: unknown) => Promise<unknown>;
    }, options: {
        signal: AbortSignal;
    }) => void | Promise<void>;
};
export function InquiryForm() {
    const { t, link, locale } = useLocale();
    const products = getProducts(locale);
    const params = useSearchParams();
    const cache = useInquiryCache();
    const queryMode=params.get('jalur');
    const queryProduct=params.get('produk');
    const queryMessage=params.get('pesan');
    const queryKey=JSON.stringify([queryMode,queryProduct,queryMessage]);
    const translatePreset=(value:string)=>{
        const original=getProducts('id');
        const english=getProducts('en');
        const prefix='Saya ingin membahas spesifikasi, sampel, dan dokumen mutu untuk ';
        const englishPrefix='I would like to discuss specifications, samples, and quality documents for ';
        const index=original.findIndex((product,i)=>value===prefix+product.name+'.'||value===englishPrefix+english[i].name+'.');
        return index<0?value:t(prefix)+products[index].name+'.';
    };
    const [saved]=useState(()=>cache.current?.query===queryKey?cache.current:null);
    const lastQuery=useRef(queryKey);
    const [mode, setMode] = useState(saved?.mode??(queryMode==='pemasok'?'pemasok':'pembeli'));
    const [draft, setDraft] = useState<Draft>(()=>saved?{...saved.draft,message:translatePreset(saved.draft.message)}:{...blank,product:products.some(p=>p.slug===queryProduct)?queryProduct!:'',message:translatePreset((queryMessage||'').slice(0,2000))});
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState('');
    const [review, setReview] = useState(false);
    const [copied, setCopied] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const supplier = mode === 'pemasok';
    useEffect(()=>{
        if(lastQuery.current===queryKey)return;
        lastQuery.current=queryKey;
        setMode(queryMode==='pemasok'?'pemasok':'pembeli');
        setDraft(d=>({...d,product:products.some(p=>p.slug===queryProduct)?queryProduct!:'',message:translatePreset((queryMessage||'').slice(0,2000))}));
        setConsent(false);setReview(false);setError('');
    },[queryKey]);
    useEffect(()=>{cache.current={draft,mode,query:queryKey};},[cache,draft,mode,queryKey]);
    useEffect(()=>{setDraft(d=>({...d,message:translatePreset(d.message)}));setError('');},[locale]);
    const update = (key: keyof Draft, value: string) => { setDraft(d => ({ ...d, [key]: value })); setError(''); };
    useEffect(() => { const context = (document as Document & {
        modelContext?: ModelContext;
    }).modelContext; if (!context?.registerTool)
        return; const lifecycle = new AbortController(); try {
        void Promise.resolve(context.registerTool({ name: 'stage_biomass_inquiry', title: t("Siapkan draf kebutuhan biomassa"), description: t("Mengisi draf formulir kebutuhan pembeli atau penawaran pemasok pada halaman ini. Tidak mengirim pesan, membuka layanan eksternal, atau menyetujui ketentuan. Pengguna meninjau dan mengirim sendiri."), inputSchema: { type: 'object', properties: { jalur: { type: 'string', enum: ['pembeli', 'pemasok'] }, produk: { type: 'string', enum: products.map(p => p.slug) }, volume: { type: 'string', maxLength: 30 }, lokasi: { type: 'string', maxLength: 180 } }, required: ['jalur', 'produk'], additionalProperties: false }, annotations: { readOnlyHint: false }, async execute(input) { if (!input || typeof input !== 'object')
                throw new Error(t("Masukan harus berupa objek.")); const v = input as Record<string, unknown>; if (Object.keys(v).some(k => !['jalur', 'produk', 'volume', 'lokasi'].includes(k)))
                throw new Error(t("Kolom tidak dikenal.")); if (!['pembeli', 'pemasok'].includes(String(v.jalur)) || !products.some(p => p.slug === v.produk))
                throw new Error(t("Jalur atau produk tidak valid.")); if (v.volume !== undefined && (typeof v.volume !== 'string' || v.volume.length > 30 || !Number.isFinite(Number(v.volume)) || Number(v.volume) <= 0))
                throw new Error(t("Volume harus berupa angka positif.")); if (v.lokasi !== undefined && (typeof v.lokasi !== 'string' || v.lokasi.length > 180))
                throw new Error(t("Lokasi tidak valid.")); setMode(String(v.jalur)); setDraft(d => ({ ...d, product: String(v.produk), volume: v.volume === undefined ? d.volume : String(v.volume), location: v.lokasi === undefined ? d.location : String(v.lokasi) })); setConsent(false); setReview(false); setError(''); await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); return { status: 'draft_staged', jalur: v.jalur, produk: v.produk, sent: false }; } }, { signal: lifecycle.signal })).catch(() => { });
    }
    catch { } return () => lifecycle.abort(); }, [locale]);
    const productName = products.find(p => p.slug === draft.product)?.name || '';
    const message = [t("Halo tim Kawakami Global Energy,"), supplier ? t("Saya ingin menawarkan pasokan biomassa.") : t("Saya ingin meminta penawaran biomassa."), '', t("Nama: ") + (draft.name.trim()), t("Perusahaan: ") + (draft.company.trim()), `Email: ${draft.email.trim()}`, `WhatsApp: ${draft.phone.trim()}`, t("Produk: ") + (productName), "" + (supplier ? t("Kapasitas pasokan") : t("Volume kebutuhan")) + ": " + (draft.volume) + t(" ton"), `${supplier ? t("Lokasi stok") : t("Tujuan pengiriman")}: ${draft.location.trim()}`, draft.date ? `${supplier ? t("Stok tersedia mulai") : t("Jadwal kebutuhan")}: ${draft.date}` : '', draft.message ? t("Spesifikasi / catatan: ") + (draft.message.trim()) : '', supplier && draft.documents ? t("Dokumentasi: ") + (draft.documents.trim()) : '', t("Mohon informasi ketersediaan, mutu, harga, dan ketentuan kerja sama.")].filter((v, i, a) => v !== '' || (i > 0 && a[i - 1] !== '')).join('\n');
    function submit(e: FormEvent) { e.preventDefault(); if (!draft.product) {
        setError(t("Pilih produk yang ingin Anda diskusikan."));
        return;
    } if (![draft.name, draft.company, draft.location].every(v => v.trim().length > 0)) {
        setError(t("Lengkapi nama, perusahaan, dan lokasi."));
        return;
    } if (!consent) {
        setError(t("Mohon centang persetujuan pemrosesan informasi sebelum meninjau pesan."));
        return;
    } setError(''); setCopied(false); setReview(true); }
    async function copy() { try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
    }
    catch {
        setError(t("Penyalinan tidak tersedia. Anda dapat memilih dan menyalin teks ringkasan secara manual."));
    } }
    return <div className="inquiry-card"><h2>{t("Mari mulai percakapan.")}</h2><Tabs value={mode} onValueChange={v => { setMode(String(v)); setError(''); setConsent(false); }}><TabsList className="custom-tabs"><TabsTrigger value="pembeli">{t("Minta penawaran")}</TabsTrigger><TabsTrigger value="pemasok">{t("Tawarkan pasokan")}</TabsTrigger></TabsList></Tabs><form className="inquiry-form" onSubmit={submit} ref={formRef}><div className="form-fields"><label className="form-field">{t("Nama lengkap *")}<input autoComplete="name" placeholder={t("Nama Anda")} required maxLength={100} value={draft.name} onChange={e => update('name', e.target.value)}/></label><label className="form-field">{t("Perusahaan *")}<input autoComplete="organization" placeholder={t("Nama perusahaan")} required maxLength={150} value={draft.company} onChange={e => update('company', e.target.value)}/></label><label className="form-field">Email *<input type="email" autoComplete="email" placeholder={t("nama@perusahaan.com")} required maxLength={150} value={draft.email} onChange={e => update('email', e.target.value)}/></label><label className="form-field">{t("Nomor WhatsApp *")}<input type="tel" autoComplete="tel" placeholder="08xx xxxx xxxx" required pattern="[+0-9 ()\-]{8,22}" maxLength={22} value={draft.phone} onChange={e => update('phone', e.target.value)}/></label><div className="form-field full"><label id="product-label">{t("Produk biomassa *")}</label><Select value={draft.product || null} onValueChange={v => update('product', String(v || ''))} items={products.map(p => ({ value: p.slug, label: p.name }))}><SelectTrigger aria-labelledby="product-label"><SelectValue placeholder={t("Pilih produk biomassa")}/></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>)}</SelectContent></Select></div><label className="form-field">{supplier ? t("Kapasitas pasokan (ton)") : t("Volume kebutuhan (ton)")} *<input type="number" min="0.01" step="any" placeholder={t("Contoh: 100")} required value={draft.volume} onChange={e => update('volume', e.target.value)}/></label><label className="form-field">{supplier ? t("Stok tersedia mulai") : t("Jadwal kebutuhan")}<input type="date" value={draft.date} onChange={e => update('date', e.target.value)}/></label><label className="form-field full">{supplier ? t("Lokasi stok") : t("Tujuan pengiriman")} *<input placeholder={t("Kota / kabupaten, provinsi")} required maxLength={180} value={draft.location} onChange={e => update('location', e.target.value)}/></label><label className="form-field full">{t("Spesifikasi & catatan tambahan")}<textarea placeholder={supplier ? t("Ceritakan asal bahan, mutu, kapasitas rutin, dan kemasan.") : t("Sampaikan persyaratan mutu, kebutuhan rutin, kemasan, atau permintaan sampel.")} maxLength={2000} value={draft.message} onChange={e => update('message', e.target.value)}/></label>{supplier && <label className="form-field full">{t("Tautan foto / dokumen mutu (opsional)")}<input type="url" placeholder="https://..." maxLength={500} value={draft.documents} onChange={e => update('documents', e.target.value)}/></label>}</div><div className="consent-line"><Checkbox id="consent" checked={consent} onCheckedChange={v => { setConsent(v); setError(''); }}/><label htmlFor="consent">{t("Saya setuju informasi ini digunakan untuk menanggapi permintaan saya sesuai ")}<Link href={link("/privasi")} target="_blank">{t("kebijakan privasi")}</Link>.</label></div>{error && <div role="alert" className="form-error">{error}</div>}<button className="btn btn-dark" type="submit">{t("Tinjau permintaan")}<ArrowRight size={18}/></button><p className="form-explainer">{t("Anda akan meninjau pesan terlebih dahulu, lalu memilih WhatsApp atau email untuk mengirimkannya.")}</p></form><Dialog open={review} onOpenChange={setReview}><DialogContent className="review-dialog"><DialogTitle>{t("Permintaan Anda siap ditinjau.")}</DialogTitle><DialogDescription>{t("Periksa rincian berikut. Pesan belum dikirim; lanjutkan melalui WhatsApp atau aplikasi email Anda.")}</DialogDescription><div className="review-text">{message}</div><div className="review-actions"><a className="btn btn-dark" href={link(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`)} target="_blank" rel="noreferrer"><MessageCircle size={17}/>{t("Buka WhatsApp")}<ArrowUpRight size={15}/></a><a className="btn btn-light" href={link(`mailto:${CONTACT.email}?subject=${encodeURIComponent((supplier ? t("Penawaran pasokan") : t("Permintaan penawaran")) + ' — ' + productName)}&body=${encodeURIComponent(message)}`)}><Mail size={16}/>{t("Buka email")}</a><button className="btn btn-light" onClick={copy}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? t("Tersalin") : t("Salin pesan")}</button></div><p className="form-explainer">{t("Tombol di atas membuka layanan pilihan Anda. Pengiriman dilakukan setelah Anda menekan kirim di layanan tersebut.")}</p>{copied && <p role="status" className="copy-feedback">{t("Ringkasan berhasil disalin.")}</p>}</DialogContent></Dialog></div>;
}
