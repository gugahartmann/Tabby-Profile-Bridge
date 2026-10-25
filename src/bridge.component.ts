import { Component } from '@angular/core'
import { ConfigService, ProfilesService, LocaleService } from 'tabby-core'
const core = require('./bridgeCore')
const formats = require('./exchangeFormats')
const i18n = require('./i18n')
interface Node { id:string;name:string;level:number;count:number;expanded:boolean;selected:boolean;partial:boolean;children:Node[];profiles:any[] }
interface ImportFile { name:string;mode:'root'|'folder';folder:string;rows:any[];preview:any[];warnings:string[] }
@Component({template:require('./bridge.component.pug')})
export class BridgeComponent {
    tab:'export'|'import'='export'
    format='csv'
    supportedFormats:any[]=formats.FORMATS
    acceptedExtensions:string=formats.FORMATS.map(f=>f.extension).join(',')
    profiles:any[]=[]
    groups:any[]=[]
    nodes:Node[]=[]
    chosenIds=new Set<string>()
    users:any[]=[]
    sharedUsers=new Set<string>()
    search=''
    exportMode:'root'|'folder'='root'
    exportFolder='Tabby Export'
    files:ImportFile[]=[]
    bulkFrom='*'
    bulkTo=''
    error=''
    info=''
    busy=false
    version:string=require('../package.json').version
    // LocaleService returns the resolved language even when Tabby is set to Automatic.
    language='en-US'
    private localeSubscription:any
    constructor(private profilesService:ProfilesService,private config:ConfigService,private locale:LocaleService){
        this.language=this.locale.getLocale()
        this.localeSubscription=this.locale.localeChanged$.subscribe(lang=>{this.language=lang})
    }
    t(key:string, params:any={}):string{return i18n.translate(this.language,key,params)}
    ngOnDestroy():void{if(this.localeSubscription)this.localeSubscription.unsubscribe()}
    async ngOnInit():Promise<void>{ await this.reload() }
    async reload():Promise<void>{
        this.error=''
        const raw=await this.profilesService.getProfiles({includeBuiltin:false,clone:true})
        this.profiles=raw.filter(p=>(p.type==='ssh'||p.type==='telnet')&&!p.isTemplate&&!p.isBuiltin).map(p=>{
            const full=this.profilesService.getConfigProxyForProfile(p)
            return {...p,options:{...full.options}}
        })
        this.groups=this.profilesService.getSyncProfileGroups()
        const valid=new Set(this.groups.map(g=>g.id))
        const byParent=new Map<string,any[]>()
        for(const g of this.groups){
            const parent=valid.has(g.parentGroupId)?g.parentGroupId:''
            byParent.set(parent,[...(byParent.get(parent)||[]),g])
        }
        const make=(parent:string,level:number,visited:Set<string>):Node[]=>(byParent.get(parent)||[]).filter(g=>!visited.has(g.id)).map(g=>{
            const children=make(g.id,level+1,new Set([...visited,g.id]))
            const profiles=this.profiles.filter(p=>p.group===g.id)
            return {id:g.id,name:g.name,level,count:profiles.length+children.reduce((n,c)=>n+c.count,0),expanded:level<2,selected:false,partial:false,children,profiles}
        })
        this.nodes=make('',0,new Set())
        const ungrouped=this.profiles.filter(p=>!p.group||!valid.has(p.group))
        if(ungrouped.length)this.nodes.push({id:'__root__',name:this.t('ungrouped'),level:0,count:ungrouped.length,expanded:true,selected:false,partial:false,children:[],profiles:ungrouped})
        this.chosenIds.clear();this.sharedUsers.clear();this.refresh()
    }
    visible():Node[]{const output:Node[]=[];const visit=(n:Node)=>{output.push(n);if(n.expanded)n.children.forEach(visit)};this.nodes.forEach(visit);return output}
    toggleGroup(n:Node,checked:boolean):void{
        const visit=(x:Node)=>{x.profiles.forEach(p=>checked?this.chosenIds.add(p.id):this.chosenIds.delete(p.id));x.children.forEach(visit)}
        visit(n);this.refresh()
    }
    toggleProfile(p:any,checked:boolean):void{if(checked)this.chosenIds.add(p.id);else this.chosenIds.delete(p.id);this.refresh()}
    selectAll(checked:boolean):void{this.chosenIds=new Set(checked?this.profiles.map(p=>p.id):[]);this.refresh()}
    refresh():void{
        const walk=(n:Node)=>{n.children.forEach(walk);const own=n.profiles.filter(p=>this.chosenIds.has(p.id)).length
            n.selected=(own===n.profiles.length&&n.children.every(c=>c.selected)&&(n.profiles.length+n.children.length>0))
            n.partial=!n.selected&&(own>0||n.children.some(c=>c.selected||c.partial))}
        this.nodes.forEach(walk)
        this.users=core.usersOf(this.selected)
        const allowed=new Set(this.users.map(u=>u.user))
        for(const user of this.sharedUsers)if(!allowed.has(user))this.sharedUsers.delete(user)
    }
    get selected():any[]{return this.profiles.filter(p=>this.chosenIds.has(p.id))}
    toggleUser(name:string,checked:boolean):void{if(checked)this.sharedUsers.add(name);else this.sharedUsers.delete(name)}
    matches(name:string):boolean{return !this.search||name.toLowerCase().includes(this.search.toLowerCase())}
    private download(name:string,content:string|Uint8Array,type:string):void{
        const blob=new Blob([content],{type})
        const url=URL.createObjectURL(blob),link=document.createElement('a')
        link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove()
        setTimeout(()=>URL.revokeObjectURL(url),1000)
    }
    async exportFile():Promise<void>{
        this.error='';this.info=''
        try {
            const folder=this.exportMode==='folder'?this.exportFolder.trim():''
            if(folder && (folder.includes('/')||folder.includes('\\')))throw Error(this.t('invalidFolder'))
            const rows=core.rowsForExport(this.profiles,this.groups,this.chosenIds,this.sharedUsers,folder)
            const adapter=formats.getFormat(this.format)
            const content=adapter.encode(rows)
            this.download('tabby-profile-bridge'+adapter.extension,content,adapter.mimeType)
            this.info=this.t('exportedSuccess',{count:rows.length})
        }catch(e){this.error=String(e.message||e)}
    }
    async onFiles(event:Event):Promise<void>{
        this.error='';this.info=''
        const input=event.target as HTMLInputElement
        const picked=Array.from(input.files||[])
        try{
            for(const file of picked){
                if(file.size>core.MAX_BYTES)throw Error(this.t('tooLarge',{file:file.name}))
                const adapter=formats.detectFormat(file.name)
                const data=adapter.binary?new Uint8Array(await file.arrayBuffer()):await file.text()
                const parsed=adapter.decode(data)
                const rows=parsed.rows
                const item:ImportFile={name:file.name,mode:'root',folder:file.name.replace(/\.[^.]+$/,''),rows,preview:[],warnings:parsed.warnings}
                this.files.push(item)
                this.refreshPreview(item)
            }
        }catch(e){this.error=String(e.message||e)}
        input.value=''
    }
    refreshPreview(file:ImportFile):void{
        file.preview=core.makePreview(file.rows,this.profiles,this.groups,file.mode==='folder'?file.folder.trim():'')
    }
    removeFile(file:ImportFile):void{this.files=this.files.filter(f=>f!==file)}
    countMatches(file:ImportFile):number{return file.preview.filter(profile=>Boolean(profile.matchedId)).length}
    get importCount():number{return this.files.reduce((n,f)=>n+f.preview.filter(p=>p.action!=='skip').length,0)}
    get importedCount():number{return this.files.reduce((n,f)=>n+f.preview.length,0)}
    applyBulkUser():void{
        this.error=''
        if(this.bulkTo.length>255){this.error=this.t('tooLongUser');return}
        for(const file of this.files)for(const p of file.preview){
            if(p.action!=='skip' && (this.bulkFrom==='*'||p.options.user===this.bulkFrom))p.editedUser=this.bulkTo
        }
    }
    get importedUsers():string[]{const set=new Set<string>();this.files.forEach(f=>f.preview.forEach(p=>set.add(p.options.user||'')));return [...set].sort()}
    setAllActions(action:string):void{for(const f of this.files)for(const p of f.preview){p.action=action==='replace'&&!p.matchedId?'create':action}}
    async performImport():Promise<void>{
        if(this.busy)return
        this.error='';this.info='';this.busy=true
        try{
            const all=this.files.flatMap(f=>f.preview.filter(p=>p.action!=='skip'))
            if(!all.length)throw Error(this.t('selectImport'))
            const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36)
            const plan=core.buildPlan(all,this.groups,uid)
            const oldProfiles=[...this.config.store.profiles],oldGroups=[...this.config.store.groups]
            try {
                const replaced=new Map(plan.replaces.map(p=>[p.id,p]))
                this.config.store.profiles=this.config.store.profiles.map(p=>replaced.get(p.id)||p)
                this.config.store.profiles.push(...plan.creates)
                this.config.store.groups.push(...plan.groups)
                await this.config.save()
            }catch(e){
                this.config.store.profiles=oldProfiles;this.config.store.groups=oldGroups
                try{await this.config.save()}catch(_){}
                throw e
            }
            this.info=this.t('importedSuccess',{created:plan.creates.length,replaced:plan.replaces.length,groups:plan.groups.length})
            this.files=[];await this.reload()
        }catch(e){this.error=String(e.message||e)}
        finally{this.busy=false}
    }
}
