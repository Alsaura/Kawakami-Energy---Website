import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';

const root=path.resolve(import.meta.dirname,'..');
function loadTypeScript(file){
  const absolute=path.join(root,file);
  const compiled=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const module={exports:{}};
  vm.runInNewContext(compiled,{module,exports:module.exports,require:createRequire(absolute)});
  return module.exports;
}
const {getTranslator,localizedHref,canonicalProductSlug,pageMetadata}=loadTypeScript('lib/i18n.ts');
const {getProducts,getFAQs}=loadTypeScript('lib/catalog.ts');
const dictionary=JSON.parse(fs.readFileSync(path.join(root,'lib/locales/en.json'),'utf8'));
const routes=[['/','/en'],['/produk','/en/products'],['/tentang','/en/about'],['/kontak','/en/contact'],['/privasi','/en/privacy'],['/ketentuan','/en/terms'],['/kredit','/en/credits'],['/ringkasan-kawakami.txt','/kawakami-overview-en.txt']];
const slugs=[['cangkang-sawit','palm-kernel-shell'],['serpihan-kayu','wood-chips'],['pelet-kayu','wood-pellets'],['serbuk-gergaji','sawdust'],['sekam-padi','rice-husks'],['cangkang-kelapa','coconut-shells']];

test('language routes round-trip and preserve inquiry parameters and anchors',()=>{
  for(const pair of [...routes,...slugs.map(([id,en])=>[`/produk/${id}`,`/en/products/${en}`])]){
    const [id,en]=pair;
    assert.equal(localizedHref(id,'en'),en);
    assert.equal(localizedHref(en,'id'),id);
    assert.equal(localizedHref(en,'en'),en);
  }
  const suffix='?jalur=pemasok&produk=cangkang-sawit&pesan=Custom%20notes#faq';
  assert.equal(localizedHref('/kontak'+suffix,'en'),'/en/contact'+suffix);
  assert.equal(localizedHref('/en/contact'+suffix,'id'),'/kontak'+suffix);
  for(const [id,en] of slugs)assert.equal(canonicalProductSlug(en),id);
  for(const href of ['https://wa.me/6281271733304?text=hello','mailto:info@bioenergy.id','#faq','/images/kawakami-logo.png'])assert.equal(localizedHref(href,'en'),href);
});

test('all localized UI strings have English translations',()=>{
  const files=['components/site-shell.tsx','components/sections.tsx','components/inquiry-form.tsx','components/locale-provider.tsx','components/ui/dialog.tsx','app/not-found.tsx',...fs.readdirSync(path.join(root,'components/pages')).map(file=>'components/pages/'+file)];
  let count=0;
  for(const file of files){
    const ast=ts.createSourceFile(file,fs.readFileSync(path.join(root,file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    function visit(node){
      if(ts.isCallExpression(node)&&node.expression.getText()==='t'&&node.arguments[0]&&ts.isStringLiteralLike(node.arguments[0])){
        const key=node.arguments[0].text;count++;
        assert(Object.hasOwn(dictionary,key)||Object.hasOwn(dictionary,key.trim()),`${file}: missing ${key}`);
        assert.equal(getTranslator('id')(key),key);
      }
      ts.forEachChild(node,visit);
    }
    visit(ast);
  }
  assert(count>250);
  assert.equal(getTranslator('en')('Minta penawaran '),'Request a quote ');
});

test('six products and all FAQs keep their original factual references in both languages',()=>{
  const id=getProducts('id'),en=getProducts('en');
  assert.equal(id.length,6);assert.equal(en.length,6);
  id.forEach((product,i)=>{
    for(const key of ['slug','image','source'])assert.equal(product[key],en[i][key]);
    assert.equal(en[i].name,product.english);
    assert.equal(en[i].uses.length,product.uses.length);
    assert.equal(en[i].checks.length,product.checks.length);
    assert(en[i].description.length>20&&en[i].detail.length>30);
  });
  assert.equal(getFAQs('id').length,6);assert.equal(getFAQs('en').length,6);
  assert.equal(pageMetadata('en','/produk','Produk Biomassa — Kawakami Global Energy').alternates.languages.en,'/en/products');
});

test('buyer and supplier review messages use the selected language and preserve user notes',()=>{
  const source=fs.readFileSync(path.join(root,'components/inquiry-form.tsx'),'utf8');
  const ast=ts.createSourceFile('inquiry-form.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let expression;
  function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText()==='message')expression=node.initializer.getText();ts.forEachChild(node,visit);}
  visit(ast);assert(expression);
  const draft={name:'Test Buyer',company:'Example Industries',email:'test@example.com',phone:'+62123456789',volume:'120',location:'Surabaya',date:'2026-11-01',message:'Custom bilingual notes: kadar air / moisture',documents:'https://example.com/spec.pdf'};
  for(const locale of ['id','en'])for(const supplier of [false,true]){
    const productName=getProducts(locale)[0].name;
    const message=vm.runInNewContext(expression,{draft,productName,supplier,t:getTranslator(locale)});
    assert(message.includes(draft.message));assert(message.includes(draft.email));
    assert(message.includes(productName));
    if(locale==='en'){
      assert(message.startsWith('Hello Kawakami Global Energy team,'));
      assert(message.includes(supplier?'Supply capacity: 120 tonnes':'Required volume: 120 tonnes'));
      assert(!message.includes('Nama:')&&!message.includes('Mohon informasi'));
    }else assert(message.startsWith('Halo tim Kawakami Global Energy,'));
    assert.equal(message.includes(draft.documents),supplier);
  }
});
