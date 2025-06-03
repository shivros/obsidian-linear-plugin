import { App, PluginSettingTab, Setting } from 'obsidian';
import LinearPlugin from './main';

export class LinearSettingsTab extends PluginSettingTab {
    plugin: LinearPlugin;

    constructor(app: App, plugin: LinearPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Linear Settings' });

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Your Linear API key')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Debug Mode')
            .setDesc('Enable debug logging in the console')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.debugMode)
                .onChange(async (value) => {
                    this.plugin.settings.debugMode = value;
                    await this.plugin.saveSettings();
                }));
    }
} 