'use strict'
const test=require('node:test')
const assert=require('node:assert/strict')
const b=require('../src/bridgeCore')
const groups=[{id:'r',name:'South'},{id:'c',name:'City',parentGroupId:'r'},{id:'p',name:'POP',parentGroupId:'c'},{id:'d',name:'Core',parentGroupId:'p'}]
const profiles=[
{id:'ssh:one',type:'ssh',name:'router, "primary"',group:'d',options:{host:'192.0.2.10',port:30022,user:'operator',auth:'agent',password:'DONT_EXPORT',privateKeys:['/private/secret.key'],proxyCommand:'echo forbidden',algorithms:{kex:['diffie-hellman-group14-sha1'],cipher:['aes128-ctr']},x11:true,keepaliveInterval:5000}},
{id:'telnet:two',type:'telnet',name:'telnet-device',group:'c',options:{host:'2001:db8::10',port:2323,user:'legacy'}}]
test('CSV roundtrip preserves hierarchy, quotes, port and algorithms, never exports secrets',()=>{
 const rows=b.rowsForExport(profiles,groups,new Set(['ssh:one','telnet:two']),new Set(['operator']),'Archive')
 const csv=b.stringifyCSV(rows)
 assert.match(csv,/group1,group2,other_groups/)
 assert.ok(!csv.includes('DONT_EXPORT')&&!csv.includes('/private/secret.key')&&!csv.includes('echo forbidden'))
 const parsed=b.readCSV(csv)
 assert.deepEqual(parsed[0].path,['Archive','South','City','POP','Core'])
 assert.equal(parsed[0].name,'router, "primary"')
 assert.equal(parsed[0].options.port,30022)
 assert.equal(parsed[0].options.user,'operator')
 assert.deepEqual(parsed[0].options.algorithms.kex,['diffie-hellman-group14-sha1'])
 assert.equal(parsed[1].options.user,'')
 assert.equal(parsed[1].options.host,'2001:db8::10')
 assert.equal(parsed[1].type,'telnet')
})
test('escaped slashes and backslashes in deep folders roundtrip',()=>{
 const parts=['grp/three','zone\\north','final']
 assert.deepEqual(b.splitOther(b.joinOther(parts)),parts)
})
test('spreadsheet formula-like cells are neutralized',()=>{
 const csv=b.stringifyCSV([{group1:'',group2:'',other_groups:'',profile:'=2+3',protocol:'ssh',hostname:'192.0.2.1',port:22,username:'',auth:'',algorithms:'',settings:''}])
 assert.match(csv,/'=2\+3/)
 assert.equal(b.readCSV(csv)[0].name,'=2+3')
})
test('existing exact matches skipped by default, same endpoint advisory',()=>{
 const inc=[{path:['South','City','POP','Core'],name:'router, "primary"',type:'ssh',options:{host:'192.0.2.10',port:30022,user:'operator'}},{path:['Different'],name:'another',type:'ssh',options:{host:'192.0.2.10',port:30022,user:'operator'}}]
 const preview=b.makePreview(inc,profiles,groups)
 assert.equal(preview[0].action,'skip');assert.equal(preview[0].matchedId,'ssh:one')
 assert.equal(preview[1].action,'create');assert.equal(preview[1].sameEndpointId,'ssh:one')
 preview[0].action='replace';preview[0].editedUser='new-operator'
 let counter=0;const plan=b.buildPlan(preview,groups,()=>String(++counter))
 assert.equal(plan.replaces.length,1)
 assert.equal(plan.replaces[0].id,'ssh:one')
 assert.equal(plan.replaces[0].options.user,'new-operator')
 assert.equal(plan.creates.length,1)
 assert.equal(plan.creates[0].options.port,30022)
 assert.equal(plan.groups.length,1)
})
test('wrapper does not change source path',()=>{
 const row={path:['A','B'],name:'Device',type:'ssh',options:{host:'192.0.2.1',port:22,user:''}}
 assert.deepEqual(b.makePreview([row],[],[],'Imported')[0].path,['Imported','A','B'])
 assert.deepEqual(row.path,['A','B'])
})
test('CSV rejects invalid ports, malicious options and huge fields',()=>{
 const base='group1,group2,other_groups,profile,protocol,hostname,port,username,auth,algorithms,settings\r\n'
 assert.throws(()=>b.readCSV(base+'A,,,R,ssh,192.0.2.1,99999,,,,\r\n'),/port/)
 assert.throws(()=>b.readCSV(base+'A,,,R,ssh,192.0.2.1,22,,,,\"{\"\"password\"\":\"\"secret\"\"}\"\r\n'),/unsupported setting/)
 assert.throws(()=>b.readCSV('x'.repeat(b.MAX_BYTES+1)),/too large/)
})
test('duplicate group names reused only at same parent',()=>{
 const r=[{path:['Region 1','Core'],name:'A',type:'ssh',options:{host:'192.0.2.1',port:22,user:''}},{path:['Region 2','Core'],name:'B',type:'ssh',options:{host:'192.0.2.2',port:22,user:''}}]
 let n=0;const plan=b.buildPlan(b.makePreview(r,[],[]),[],()=>String(++n))
 assert.equal(plan.groups.length,4)
 assert.notEqual(plan.creates[0].group,plan.creates[1].group)
})
