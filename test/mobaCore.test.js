'use strict'
const test=require('node:test')
const assert=require('node:assert/strict')
const bridge=require('../src/bridgeCore')
const moba=require('../src/mobaCore')
const groups=[{id:'s',name:'Conexão Sul'},{id:'c',name:'Porto Alegre',parentGroupId:'s'},{id:'p',name:'POP 01',parentGroupId:'c'},{id:'z',name:'Backbone',parentGroupId:'p'}]
const profiles=[
{id:'ssh1',type:'ssh',name:'SW-CORE-01',group:'z',options:{host:'192.0.2.10',port:30022,user:'operator',x11:true,privateKeys:['/do/not/leak'],password:'never-export'}},
{id:'ssh2',type:'ssh',name:'BNG-01',group:'z',options:{host:'2001:db8::1',port:22,user:'',x11:false}},
{id:'telnet',type:'telnet',name:'telnet-legacy',group:'c',options:{host:'198.51.100.10',port:7923,user:'test'}}]
test('MobaXterm native roundtrip preserves nesting, SSH+Telnet and custom ports, removes secrets',()=>{
 const rows=bridge.rowsForExport(profiles,groups,new Set(['ssh1','ssh2','telnet']),new Set(['operator','test']),'Shared')
 const raw=moba.writeMoba(rows)
 assert.ok(raw instanceof Uint8Array)
 const text=moba.decode(raw)
 assert.match(text,/\[Bookmarks\]/)
 assert.match(text,/SubRep=Shared\\Conexão Sul\\Porto Alegre\\POP 01\\Backbone/)
 assert.match(text,/#109#0%192\.0\.2\.10%30022%operator/)
 assert.match(text,/#98#1%198\.51\.100\.10%7923%test/)
 assert.ok(!text.includes('never-export')&&!text.includes('do/not/leak'))
 assert.ok(!text.includes('\n[Bookmarks_1]\n')) // CRLF
 const parsed=moba.readMoba(raw)
 assert.equal(parsed.rows.length,3)
 assert.deepEqual(parsed.rows[0].path,['Shared','Conexão Sul','Porto Alegre','POP 01','Backbone'])
 assert.equal(parsed.rows[0].options.host,'192.0.2.10')
 assert.equal(parsed.rows[0].options.port,30022)
 assert.equal(parsed.rows[0].options.user,'operator')
 assert.equal(parsed.rows[0].options.x11,true)
 assert.equal(parsed.rows[1].options.user,'')
 assert.equal(parsed.rows[2].type,'telnet')
 assert.equal(parsed.rows[2].options.port,7923)
})
test('Reads old short sessions and ignores non-bookmark sections',()=>{
 const raw='[Other]\r\nIgnored=#109#0%invalid%22%user%\r\n[Bookmarks]\r\nSubRep=Conexão Sinos\r\nImgNum=41\r\nLegacy SSH=#109#0%192.0.2.15%22%admin%\r\n[Bookmarks_1]\r\nSubRep=Conexão Sinos\\City\r\nImgNum=41\r\nLegacy Telnet=#98#1%198.51.100.1%2323%user%\r\n'
 const decoded=moba.readMoba(moba.win1252(raw))
 assert.equal(decoded.rows.length,2)
 assert.deepEqual(decoded.rows[1].path,['Conexão Sinos','City'])
 assert.equal(decoded.rows[0].options.user,'admin')
})
test('Moba partial export warns about proxy, gateway, key path and unknown types',()=>{
 const raw='[Bookmarks]\r\nSubRep=City\r\nImgNum=41\r\nDesktop=#91#4%192.0.2.1%3389%user%\r\nSwitch=#109#0%192.0.2.2%22%admin%%%%gateway%%%0%0%0%keyfile\r\n'
 const v=moba.readMoba(raw)
 assert.equal(v.rows.length,1)
 assert.ok(v.warnings.length>=2)
})
test('Moba delimiter validation avoids silent export corruption',()=>{
 const row={path:['Main'],name:'switch=bad',type:'ssh',options:{host:'192.0.2.1',port:22,user:'user'}}
 assert.throws(()=>moba.writeMoba([row]),/Invalid MobaXterm session/)
 assert.throws(()=>moba.win1252('terminal 😊'),/Windows-1252/)
})
test('Moba refuses files without Bookmarks',()=>assert.throws(()=>moba.readMoba('[Other]\r\nname=value\r\n'),/Bookmarks/))
