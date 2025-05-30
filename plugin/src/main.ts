import { Plugin } from 'obsidian';
import { LinearSettingsTab } from './SettingsTab';
import { LinearPluginSettings, DEFAULT_SETTINGS } from './settings';
import { LinearProcessor } from './processors/LinearProcessor';

export default class LinearPlugin extends Plugin {
    settings: LinearPluginSettings;
    private processor: LinearProcessor;

    async onload() {
        await this.loadSettings();

        // Add settings tab
        this.addSettingTab(new LinearSettingsTab(this.app, this));

        // Register Linear code block processor
        this.registerMarkdownCodeBlockProcessor('linear', (source, el, ctx) => {
            if (!this.processor || this.processor['apiKey'] !== this.settings.apiKey) {
                this.processor = new LinearProcessor(this.settings.apiKey);
            }
            this.processor.process(source, el, ctx);
        });

        console.log('Linear plugin loaded');
    }

    onunload() {
        console.log('Linear plugin unloaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
} 