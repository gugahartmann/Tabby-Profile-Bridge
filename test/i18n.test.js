'use strict'
const test=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const {TEXT,resolveLanguage,translate}=require('../src/i18n')
const base=path.resolve(__dirname,'..')
const template=fs.readFileSync(path.join(base,'src','bridge.component.pug'),'utf8')
test('english is default and Portuguese variants use translated copy',()=>{
    assert.equal(resolveLanguage('en-US'),'en')
    assert.equal(resolveLanguage('fr-FR'),'en')
    assert.equal(resolveLanguage('pt-BR'),'pt')
    assert.equal(resolveLanguage('pt-PT'),'pt')
    assert.equal(resolveLanguage('PT-br'),'pt')
    assert.equal(translate(null,'export'),'Export')
    assert.equal(translate('pt-BR','export'),'Exportar')
    assert.equal(translate('pt-PT','import'),'Importar')
    assert.equal(translate('de-DE','replace'),'Replace existing')
    assert.equal(translate('pt-BR','applyChanges',{count:3}),'Aplicar 3 alterações selecionadas')
    assert.equal(translate('en-US','matchingNames',{count:2}),'2 matching names in destination')
})
test('all translated keys have both languages and the Angular template has no missing key',()=>{
    const used=[...template.matchAll(/\bt\('([a-zA-Z][a-zA-Z0-9]+)'/g)].map(m=>m[1])
    assert.ok(used.length>=45,'Expected a fully localized UI')
    for(const key of used){
        assert.ok(TEXT[key], 'Undeclared UI translation: '+key)
        assert.ok(TEXT[key].en && TEXT[key].pt,'Incomplete UI translation: '+key)
    }
    for(const [key,value] of Object.entries(TEXT)){
        assert.equal(typeof value.en,'string',key)
        assert.equal(typeof value.pt,'string',key)
        assert.notEqual(value.en.trim(),'')
        assert.notEqual(value.pt.trim(),'')
    }
})
test('plugin follows Tabby LocaleService and displays installed package version at top right',()=>{
    const ts=fs.readFileSync(path.join(base,'src','bridge.component.ts'),'utf8')
    assert.match(ts,/LocaleService/)
    assert.match(ts,/locale\.getLocale\(\)/)
    assert.match(ts,/locale\.localeChanged\$\.subscribe/)
    assert.match(ts,/localeSubscription\.unsubscribe\(\)/)
    assert.match(ts,/require\('\.\.\/package\.json'\)\.version/)
    assert.match(template,/by gugahartmann .* v\{\{version\}\}/)
    assert.equal(require('../package.json').version,'0.2.2')
})
test('neither public README refers to the internal round-trip test suite',()=>{
    for(const file of ['README.md','README.pt-BR.md']){
        const value=fs.readFileSync(path.join(base,file),'utf8')
        assert.doesNotMatch(value,/\b(test suite|round.trip|testes automatizados|tests|regression suite|suíte de testes)\b/i,file)
        assert.match(value,/README\.pt-BR\.md|README\.md/)
    }
})
