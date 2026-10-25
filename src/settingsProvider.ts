import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'
import { BridgeComponent } from './bridge.component'
@Injectable()
export class BridgeSettingsProvider extends SettingsTabProvider {
    id='profile-bridge'
    title='Profile Bridge'
    icon='exchange-alt'
    weight=210
    getComponentType():any{return BridgeComponent}
}
