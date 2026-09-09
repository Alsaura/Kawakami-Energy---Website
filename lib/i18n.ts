import english from './locales/en.json';
import type {Metadata} from 'next';

export type Locale='id'|'en';
const dictionary:Record<string,string>=english;
const paths:Record<string,string>={
  '/':'/en','/produk':'/en/products','/tentang':'/en/about','/kontak':'/en/contact',
  '/privasi':'/en/privacy','/ketentuan':'/en/terms','/kredit':'/en/credits',
  '/ringkasan-kawakami.txt':'/kawakami-overview-en.txt',
};
const productSlugs:Record<string,string>={
  'cangkang-sawit':'palm-kernel-shell','serpihan-kayu':'wood-chips','pelet-kayu':'wood-pellets',
  'serbuk-gergaji':'sawdust','sekam-padi':'rice-husks','cangkang-kelapa':'coconut-shells',
};
for(const [id,en] of Object.entries(productSlugs))paths[`/produk/${id}`]=`/en/products/${en}`;
const reversePaths=Object.fromEntries(Object.entries(paths).map(([id,en])=>[en,id]));

export function getTranslator(locale:Locale){
  return (text:string)=>{
    if(locale==='id')return text;
    if(Object.hasOwn(dictionary,text))return dictionary[text];
    const trimmed=text.trim();
    if(Object.hasOwn(dictionary,trimmed))return text.replace(trimmed,dictionary[trimmed]);
    return text;
  };
}
export function canonicalPath(pathname:string){
  const path=pathname.replace(/\/$/,'')||'/';
  return reversePaths[path]??(path.startsWith('/en/')?path.slice(3):path);
}
export function localizedHref(href:string,locale:Locale){
  if(!href.startsWith('/')||href.startsWith('//'))return href;
  const separator=href.search(/[?#]/);
  const path=separator<0?href:href.slice(0,separator);
  const suffix=separator<0?'':href.slice(separator);
  const canonical=canonicalPath(path);
  if(/\.[a-z0-9]+$/i.test(path)&&!reversePaths[path]&&!paths[path])return href;
  return (locale==='en'?(paths[canonical]??`/en${canonical==='/'?'':canonical}`):canonical)+suffix;
}
export function canonicalProductSlug(slug:string){
  return Object.entries(productSlugs).find(([,en])=>en===slug)?.[0]??slug;
}
export function getLocaleTools(locale:Locale){
  return {locale,t:getTranslator(locale),link:(href:string)=>localizedHref(href,locale)};
}
export function pageMetadata(locale:Locale,path:string,title:string,description?:string):Metadata{
  const t=getTranslator(locale);
  return {title:t(title),description:description?t(description):undefined,
    alternates:{languages:{id:localizedHref(path,'id'),en:localizedHref(path,'en')}}};
}
