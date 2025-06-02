import { App, PluginSettingTab, Setting } from 'obsidian';
import type LinearPlugin from './main';

export class LinearSettingsTab extends PluginSettingTab {
    constructor(app: App, private plugin: LinearPlugin) {
        super(app, plugin);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Linear Plugin Settings' });

        new Setting(containerEl)
            .setName('Linear API Key')
            .setDesc('Enter your Linear API key from Linear Settings > API')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));
    }
} 