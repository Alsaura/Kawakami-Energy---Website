'use client';
import {createContext,useContext,useEffect,useRef,useState,useTransition,type RefObject} from 'react';
import {Switch} from '@/components/ui/switch';
import {usePathname,useRouter} from 'next/navigation';
import {getLocaleTools,localizedHref,type Locale} from '@/lib/i18n';

const LocaleContext=createContext<Locale>('id');
export type InquiryDraft={name:string;company:string;email:string;phone:string;product:string;volume:string;location:string;date:string;message:string;documents:string};
type CachedInquiry={draft:InquiryDraft;mode:string;query:string};
const InquiryCacheContext=createContext<RefObject<CachedInquiry|null>|null>(null);
export function LocaleProvider({locale,children}:{locale:Locale;children:React.ReactNode}){
  // Session memory only: switching languages keeps a draft, reload/close clears it.
  const inquiryCache=useRef<CachedInquiry|null>(null);
  const pathname=usePathname();
  const activeLocale=pathname?(pathname==='/en'||pathname.startsWith('/en/')?'en':'id'):locale;
  useEffect(()=>{document.documentElement.lang=activeLocale;},[activeLocale]);
  return <LocaleContext.Provider value={activeLocale}><InquiryCacheContext.Provider value={inquiryCache}>{children}</InquiryCacheContext.Provider></LocaleContext.Provider>;
}
export function useLocale(){return getLocaleTools(useContext(LocaleContext));}
export function useInquiryCache(){
  const cache=useContext(InquiryCacheContext);
  if(!cache)throw new Error('Inquiry form requires LocaleProvider.');
  return cache;
}
export function LanguageSwitcher(){
  const {locale,t}=useLocale();
  const router=useRouter();
  const [english,setEnglish]=useState(locale==='en');
  const [pending,startTransition]=useTransition();
  useEffect(()=>{
    if(!pending)setEnglish(locale==='en');
  },[locale,pending]);
  function changeLanguage(checked:boolean){
    if(pending)return;
    setEnglish(checked);
    const language=checked?'en':'id';
    const destination=localizedHref(window.location.pathname+window.location.search+window.location.hash,language);
    startTransition(()=>router.push(destination,{scroll:false}));
  }
  return <div className="language-switch" data-english={english}>
    <Switch className="language-toggle" checked={english} onCheckedChange={changeLanguage}
      disabled={pending} aria-busy={pending} aria-label={t('Gunakan bahasa Inggris')}/>
    <span className="language-labels" aria-hidden="true"><span lang="id">ID</span><span lang="en">EN</span></span>
  </div>;
}
