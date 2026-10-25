import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { SettingsTabProvider } from 'tabby-settings'
import { BridgeSettingsProvider } from './settingsProvider'
import { BridgeComponent } from './bridge.component'
@NgModule({
    imports:[CommonModule,FormsModule,NgbModule],
    declarations:[BridgeComponent],
    providers:[{provide:SettingsTabProvider,useClass:BridgeSettingsProvider,multi:true}]
})
export default class TabbyProfileBridgeModule {}
