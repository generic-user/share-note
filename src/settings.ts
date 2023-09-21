import { App, PluginSettingTab, Setting, TextComponent } from 'obsidian'
import SharePlugin from './main'

export enum ThemeMode {
  'Same as theme',
  Dark,
  Light
}

export interface ShareSettings {
  server: string;
  uid: string;
  apiKey: string;
  yamlField: string;
  noteWidth: string;
  themeMode: ThemeMode;
  showFooter: boolean;
  removeYaml: boolean;
  clipboard: boolean;
}

export const DEFAULT_SETTINGS: ShareSettings = {
  server: 'https://api.obsidianshare.com',
  uid: '',
  apiKey: '',
  yamlField: 'share',
  noteWidth: '700px',
  themeMode: ThemeMode['Same as theme'],
  showFooter: true,
  removeYaml: true,
  clipboard: true
}

export class ShareSettingsTab extends PluginSettingTab {
  plugin: SharePlugin
  apikeyEl: TextComponent

  constructor (app: App, plugin: SharePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Plugin setup')
      .setHeading()

    // API key
    new Setting(containerEl)
      .setName('API key')
      .setDesc('Click the button to request a new API key')
      .addButton(btn => btn
        .setButtonText('Connect plugin')
        .setCta()
        .onClick(() => {
          window.open('https://challenge.obsidianshare.com?id=' + this.plugin.settings.uid)
        }))
      .addText(inputEl => {
        this.apikeyEl = inputEl // so we can update it with the API key during the URI callback
        inputEl
          .setPlaceholder('API key')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value
            await this.plugin.saveSettings()
          })
      })

    // Local YAML field
    new Setting(containerEl)
      .setName('Frontmatter property prefix')
      .setDesc('The frontmatter property for storing the shared link and updated time. A value of `share` will create frontmatter fields of `share_link` and `share_updated`.')
      .addText(text => text
        .setPlaceholder(DEFAULT_SETTINGS.yamlField)
        .setValue(this.plugin.settings.yamlField)
        .onChange(async (value) => {
          this.plugin.settings.yamlField = value || DEFAULT_SETTINGS.yamlField
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Upload options')
      .setHeading()

    // Show/hide the footer
    new Setting(containerEl)
      .setName('Light/Dark mode')
      .setDesc('Choose the mode with which your files will be shared')
      .addDropdown(dropdown => {
        dropdown
          .addOption('Same as theme', 'Same as theme')
          .addOption('Dark', 'Dark')
          .addOption('Light', 'Light')
          .setValue(ThemeMode[this.plugin.settings.themeMode])
          .onChange(async value => {
            this.plugin.settings.themeMode = ThemeMode[value as keyof typeof ThemeMode]
            await this.plugin.saveSettings()
          })
      })

    // Note reading width
    new Setting(containerEl)
      .setName('Note reading width')
      .setDesc('The max width for the content of your shared note, accepts any CSS unit. The width is also limited by the reading width in your theme, so if you set it to 100% it will be limited at that point by your theme.')
      .addText(text => text
        .setPlaceholder(DEFAULT_SETTINGS.noteWidth)
        .setValue(this.plugin.settings.noteWidth)
        .onChange(async (value) => {
          this.plugin.settings.noteWidth = value || DEFAULT_SETTINGS.noteWidth
          await this.plugin.saveSettings()
        }))

    // Strip frontmatter
    new Setting(containerEl)
      .setName('Remove published frontmatter/YAML')
      .setDesc('Remove frontmatter/YAML/properties from the shared note')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.removeYaml)
          .onChange(async (value) => {
            this.plugin.settings.removeYaml = value
            await this.plugin.saveSettings()
            this.display()
          })
      })

    // Copy to clipboard
    new Setting(containerEl)
      .setName('Copy the link to clipboard after sharing')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.clipboard)
          .onChange(async (value) => {
            this.plugin.settings.clipboard = value
            await this.plugin.saveSettings()
            this.display()
          })
      })

    // Show/hide the footer
    new Setting(containerEl)
      .setName('Show the footer')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.showFooter)
          .onChange(async (value) => {
            this.plugin.settings.showFooter = value
            await this.plugin.saveSettings()
            this.display()
          })
      })

    new Setting(containerEl)
      .setName('Debug info')
      .setHeading()

    new Setting(containerEl)
      .setName('User ID')
      .setDesc('If you need it for debugging purposes, this is your user ID')
      .addText(text => text
        .setValue(this.plugin.settings.uid)
        .setDisabled(true))
  }
}
