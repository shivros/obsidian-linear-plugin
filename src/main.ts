import { Plugin } from 'obsidian';
import { LinearSettingsTab } from './SettingsTab';
import { LinearPluginSettings, DEFAULT_SETTINGS } from './settings';
import { LinearProcessor } from './processors/LinearProcessor';

export default class LinearPlugin extends Plugin {
    settings: LinearPluginSettings;

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

            try {
                const div = el.createDiv();
                const processor = new LinearProcessor(this.settings, div, this.app);
                ctx.addChild(processor);
                await processor.process(source, div, ctx);
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

        if (!this.settings.integrations?.length) {
            this.settings.integrations = [{ name: 'default', apiKey: '' }];
        }

        if (!this.settings.defaultIntegration || !this.settings.integrations.find(i => i.name === this.settings.defaultIntegration)) {
            this.settings.defaultIntegration = this.settings.integrations[0].name;
        }

        this.log('Settings loaded', this.settings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.log('Settings saved', this.settings);
    }
} 