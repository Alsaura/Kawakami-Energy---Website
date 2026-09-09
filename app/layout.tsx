import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {Geist} from 'next/font/google';
import './globals.css';
import {Header,Footer,Motion,FloatingContact} from '@/components/site-shell';
import {LocaleProvider} from '@/components/locale-provider';
import {getTranslator,type Locale} from '@/lib/i18n';
const geist=Geist({variable:'--font-geist-sans',subsets:['latin']});
async function requestLocale():Promise<Locale>{return (await headers()).get('x-kawakami-locale')==='en'?'en':'id';}
export async function generateMetadata():Promise<Metadata>{
  const t=getTranslator(await requestLocale());
  return {title:t('Kawakami Global Energy — Energi untuk masa depan'),description:t('Jelajahi solusi biomassa Kawakami Global Energy. Temukan produk, diskusikan kebutuhan industri, dan bangun kemitraan pasokan energi hijau.'),icons:{icon:'/icon.svg'}};
}
export default async function RootLayout({children}:{children:React.ReactNode}){
  const locale=await requestLocale();
  return <html lang={locale}><body className={geist.variable}><LocaleProvider locale={locale}><Header/>{children}<Footer/><FloatingContact/><Motion/></LocaleProvider></body></html>;
}
