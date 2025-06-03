import { Plugin } from 'obsidian';
import { LinearSettingsTab } from './SettingsTab';
import { LinearPluginSettings, DEFAULT_SETTINGS } from './settings';
import { LinearProcessor } from './processors/LinearProcessor';

export default class LinearPlugin extends Plugin {
    settings: LinearPluginSettings;
    private processor: LinearProcessor;

    private log(message: string, data?: any, isError: boolean = false) {
        if (!this.settings?.debugMode) return;
        
        const prefix = '🔄 Linear Plugin: ';
        if (isError) {
            console.error(prefix + message, data);
        } else {
            console.log(prefix + message, data || '');
        }
    }

    async onload() {
        this.log('Loading plugin');
        await this.loadSettings();
        this.log('Settings loaded', this.settings);

        // Add settings tab
        this.addSettingTab(new LinearSettingsTab(this.app, this));
        this.log('Settings tab added');

        // Register Linear code block processor
        this.registerMarkdownCodeBlockProcessor('linear', async (source, el, ctx) => {
            this.log('Processing Linear code block', { source });
            
            if (!this.settings.apiKey) {
                this.log('No API key configured - cannot process block');
                const div = el.createDiv();
                div.setText('Please configure your Linear API key in settings.');
                return;
            }

            if (!this.processor) {
                this.log('Creating new Linear processor');
                this.processor = new LinearProcessor(this.settings);
            }

            try {
                const div = el.createDiv();
                await this.processor.process(source, div, ctx);
            } catch (error) {
                this.log('Failed to process Linear block', error, true);
                el.createEl('div', {
                    cls: 'linear-error',
                    text: 'Error loading Linear issues. Please check the console for details.'
                });
            }
        });

        this.log('Plugin loaded successfully');
    }

    onunload() {
        this.log('Plugin unloaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.log('Settings loaded', this.settings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.log('Settings saved', this.settings);
    }
} 