'use client';
import { useLocale, LanguageSwitcher } from '@/components/locale-provider';
import { canonicalPath } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Menu, MessageCircle, ArrowRight, Leaf } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CONTACT } from '@/lib/catalog';
export function Brand() { const { t, link, locale } = useLocale(); return <Link href={link("/")} className="brand" aria-label={t("Kawakami Global Energy, beranda")}><img src="/images/kawakami-logo.png" alt="Kawakami Global Energy" width="400" height="130"/><img className="brand-word" src="/images/kawakami-logo.png" alt="" aria-hidden="true" width="400" height="130"/></Link>; }
export function Header() { const { t, link, locale } = useLocale(); const pathname = canonicalPath(usePathname()); const [open, setOpen] = useState(false);
    const [scrolled,setScrolled]=useState(false);
    const home=pathname==='/';
    useEffect(()=>{
        let frame=0;
        let compact=false;
        const update=()=>{
            frame=0;
            // A small dead zone prevents flicker near the top of the page.
            const next=window.scrollY>28?true:window.scrollY<8?false:compact;
            if(next!==compact){compact=next;setScrolled(next);}
        };
        const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
        setScrolled(false);
        update();
        window.addEventListener('scroll',onScroll,{passive:true});
        return()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame);};
    },[pathname]); const links = [['/', t("Beranda")], ['/produk', t("Produk")], ['/tentang', t("Tentang Kami")], ['/kontak', t("Kontak")]]; return <><a className="skip-link" href={link("#main")}>{t("Langsung ke konten")}</a><header className="site-header shell" data-home={home} data-scrolled={scrolled}><Brand /><nav className="site-nav" aria-label={t("Navigasi utama")}>{links.map(([href, text]) => <Link key={href} href={link(href)} aria-current={(href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'page' : undefined}>{text}</Link>)}</nav><LanguageSwitcher /><Link className="header-action" href={link("/kontak")}>{t("Mari berkolaborasi ")}<ArrowUpRight size={17}/></Link><button className="menu-toggle" aria-label={t("Buka menu")} onClick={() => setOpen(true)}><Menu size={20}/></button></header>{!home&&<div className="header-spacer" aria-hidden="true"/>}<Dialog open={open} onOpenChange={setOpen}><DialogContent className="mobile-menu"><DialogTitle>{t("Jelajahi Kawakami")}</DialogTitle><DialogDescription>{t("Energi hari ini. Masa depan lebih hijau.")}</DialogDescription><nav>{links.map(([href, text]) => <Link key={href} href={link(href)} onClick={() => setOpen(false)}>{text}<ArrowUpRight size={20}/></Link>)}</nav><Link className="btn btn-lime" href={link("/kontak")} onClick={() => setOpen(false)}>{t("Mari berkolaborasi")}<ArrowRight size={18}/></Link></DialogContent></Dialog></>; }
export function Footer() { const { t, link, locale } = useLocale(); return <footer className="footer"><div className="shell"><div className="footer-grid"><div><Brand /><p>{t("Menghubungkan potensi alam dengan kebutuhan energi. Bersama, kita tumbuhkan masa depan yang lebih hijau.")}</p><div className="footer-sign"><Leaf size={16}/>Rooted in nature. Driven by tomorrow.</div></div><div><h4>{t("Jelajahi")}</h4><div className="footer-links"><Link href={link("/produk")}>{t("Produk biomassa")}</Link><Link href={link("/tentang")}>{t("Tentang Kawakami")}</Link><Link href={link("/tentang#jaringan")}>{t("Wilayah & logistik")}</Link><Link href={link("/kontak?jalur=pemasok")}>{t("Menjadi mitra pemasok")}</Link><Link href={link("/kontak#faq")}>{t("Pertanyaan umum")}</Link></div></div><div><h4>{t("Mari terhubung")}</h4><div className="footer-links"><a href={link(`mailto:${CONTACT.email}`)}>{CONTACT.email} <ArrowUpRight size={14}/></a><a href={link(`https://wa.me/${CONTACT.whatsapp}`)} target="_blank" rel="noreferrer">{CONTACT.phone} <ArrowUpRight size={14}/></a><a href={link(CONTACT.maps)} target="_blank" rel="noreferrer">Gold Coast Office Tower<br />{t("PIK, Jakarta Utara")}</a></div></div></div><div className="footer-bottom"><span>© 2026 Kawakami Global Energy</span><div><Link href={link("/privasi")}>{t("Kebijakan privasi")}</Link><Link href={link("/ketentuan")}>{t("Ketentuan penggunaan")}</Link><Link href={link("/kredit")}>{t("Kredit visual")}</Link></div></div></div></footer>; }
export function Motion() {
    const pathname = usePathname();
    useEffect(() => {
        const preference = matchMedia('(prefers-reduced-motion: reduce)');
        const animations = new Map<Element, Animation>();
        const hero = document.querySelector<HTMLElement>('.hero');
        const heroImage = hero?.querySelector<HTMLElement>('.hero-image');
        let heroVisible = true;
        let disposed = false;
        let parallaxFrame = 0;
        let previousTime = 0;
        let heroTop = 0;
        let parallaxLimit = 0;
        let parallaxOffset = 0;
        let revealObserver: IntersectionObserver | undefined;
        let frame = 0;
        const cancelAnimations = () => {
            animations.forEach(animation => animation.cancel());
            animations.clear();
        };
        const parallaxTarget = () => Math.min(parallaxLimit, Math.max(0, (window.scrollY - heroTop) * .18));
        const stopParallax = () => {
            cancelAnimationFrame(parallaxFrame);
            parallaxFrame = 0;
            previousTime = 0;
        };
        const drawParallax = (time: number) => {
            parallaxFrame = 0;
            if (disposed || !heroImage || document.hidden || !heroVisible || preference.matches)
                return;
            const target = parallaxTarget();
            // Time-based easing stays consistent on both 60 Hz and 120 Hz screens.
            const elapsed = previousTime ? Math.min(time - previousTime, 48) : 16.67;
            previousTime = time;
            parallaxOffset += (target - parallaxOffset) * (1 - Math.exp(-elapsed / 75));
            const settled = Math.abs(target - parallaxOffset) < .05;
            if (settled)
                parallaxOffset = target;
            heroImage.style.setProperty('--hero-parallax-y', `${parallaxOffset.toFixed(3)}px`);
            if (!settled)
                parallaxFrame = requestAnimationFrame(drawParallax);
            else
                previousTime = 0;
        };
        const queueParallax = () => {
            if (!disposed && heroImage && heroVisible && !document.hidden && !preference.matches && !parallaxFrame) {
                parallaxFrame = requestAnimationFrame(drawParallax);
            }
        };
        const measureParallax = () => {
            if (disposed || !hero || !heroImage)
                return;
            heroTop = hero.getBoundingClientRect().top + window.scrollY;
            // Keep movement safely inside the image overscan defined at each breakpoint.
            parallaxLimit = Math.max(0, parseFloat(getComputedStyle(hero).getPropertyValue('--hero-parallax-room')) - 16);
            parallaxOffset = preference.matches ? 0 : parallaxTarget();
            heroImage.style.setProperty('--hero-parallax-y', `${parallaxOffset.toFixed(3)}px`);
        };
        const updateLandscape = () => {
            const paused = document.hidden || !heroVisible || preference.matches;
            hero?.toggleAttribute('data-motion-paused', paused);
            if (paused)
                stopParallax();
            else
                queueParallax();
            if (preference.matches) {
                parallaxOffset = 0;
                heroImage?.style.removeProperty('--hero-parallax-y');
            }
        };
        const setupReveals = () => {
            revealObserver?.disconnect();
            cancelAnimations();
            updateLandscape();
            if (preference.matches || !('IntersectionObserver' in window))
                return;
            revealObserver = new IntersectionObserver(entries => {
                if (disposed)
                    return;
                let stagger = 0;
                entries.forEach(entry => {
                    if (!entry.isIntersecting)
                        return;
                    revealObserver?.unobserve(entry.target);
                    if (document.hidden || entry.target.contains(document.activeElement))
                        return;
                    const animation = entry.target.animate([{ opacity: 0, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], { duration: 860, delay: Math.min(stagger++ * 65, 195), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
                    animations.set(entry.target, animation);
                    animation.onfinish = () => animations.delete(entry.target);
                });
            }, { threshold: 0, rootMargin: '0px 0px 32px 0px' });
            const targets = new Set<Element>();
            document.querySelectorAll('[data-reveal]').forEach(element => {
                // Animate grid items separately without changing their content or layout.
                if (element.matches('.product-grid,.benefit-grid,.partner-grid,.values-grid')) {
                    Array.from(element.children).forEach(child => targets.add(child));
                }
                else
                    targets.add(element);
            });
            targets.forEach(element => {
                // Already-visible content stays visible during hydration and navigation.
                if (element.getBoundingClientRect().top >= window.innerHeight)
                    revealObserver?.observe(element);
            });
        };
        const revealFocus = (event: FocusEvent) => {
            if (!(event.target instanceof Node))
                return;
            animations.forEach((animation, element) => {
                if (element.contains(event.target as Node)) {
                    animation.finish();
                    animations.delete(element);
                }
            });
        };
        const onPreferenceChange = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(setupReveals);
        };
        const onVisibilityChange = () => {
            if (document.hidden)
                cancelAnimations();
            updateLandscape();
        };
        const heroObserver = hero && 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
            if (disposed)
                return;
            heroVisible = entry.isIntersecting;
            updateLandscape();
        }) : undefined;
        measureParallax();
        const heroResizeObserver = hero && 'ResizeObserver' in window ? new ResizeObserver(measureParallax) : undefined;
        if (hero) {
            heroObserver?.observe(hero);
            heroResizeObserver?.observe(hero);
            window.addEventListener('scroll', queueParallax, { passive: true });
            window.addEventListener('resize', measureParallax, { passive: true });
        }
        frame = requestAnimationFrame(setupReveals);
        document.addEventListener('focusin', revealFocus);
        document.addEventListener('visibilitychange', onVisibilityChange);
        preference.addEventListener('change', onPreferenceChange);
        return () => {
            disposed = true;
            stopParallax();
            heroResizeObserver?.disconnect();
            window.removeEventListener('scroll', queueParallax);
            window.removeEventListener('resize', measureParallax);
            heroImage?.style.removeProperty('--hero-parallax-y');
            cancelAnimationFrame(frame);
            revealObserver?.disconnect();
            heroObserver?.disconnect();
            cancelAnimations();
            document.removeEventListener('focusin', revealFocus);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            preference.removeEventListener('change', onPreferenceChange);
            hero?.removeAttribute('data-motion-paused');
        };
    }, [pathname]);
    return null;
}
export function FloatingContact() { const { t, link, locale } = useLocale(); return <a className="floating-contact" href={link(`https://wa.me/${CONTACT.whatsapp}`)} target="_blank" rel="noreferrer" aria-label={t("Diskusikan kebutuhan melalui WhatsApp")}><MessageCircle size={23}/><span>{t("Diskusikan kebutuhan")}</span></a>; }
