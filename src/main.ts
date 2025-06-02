import { Plugin } from 'obsidian';
import { LinearSettingsTab } from './SettingsTab';
import { LinearPluginSettings, DEFAULT_SETTINGS } from './settings';
import { LinearProcessor } from './processors/LinearProcessor';

const DEBUG_PREFIX = '🔄 Linear Plugin:';
function debug(message: string, data?: any) {
    if (data) {
        console.log(DEBUG_PREFIX, message, data);
    } else {
        console.log(DEBUG_PREFIX, message);
    }
}

export default class LinearPlugin extends Plugin {
    settings: LinearPluginSettings;
    private processor: LinearProcessor;

    async onload() {
        debug('Loading plugin');
        await this.loadSettings();
        debug('Settings loaded', this.settings);

        // Add settings tab
        this.addSettingTab(new LinearSettingsTab(this.app, this));
        debug('Settings tab added');

        // Register Linear code block processor
        this.registerMarkdownCodeBlockProcessor('linear', async (source, el, ctx) => {
            debug('Processing Linear code block', { source });
            
            if (!this.settings.apiKey) {
                debug('No API key configured');
                const div = el.createDiv();
                div.setText('Please configure your Linear API key in settings.');
                return;
            }

            if (!this.processor || this.processor['apiKey'] !== this.settings.apiKey) {
                debug('Creating new Linear processor');
                this.processor = new LinearProcessor(this.settings.apiKey);
            }

            try {
                const div = el.createDiv();
                await this.processor.process(source, div, ctx);
            } catch (error) {
                debug('Error processing Linear block', error);
                const div = el.createDiv();
                div.setText('Error processing Linear block. Check console for details.');
            }
        });

        debug('Plugin loaded successfully');
    }

    onunload() {
        debug('Plugin unloaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        debug('Settings loaded', this.settings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        debug('Settings saved', this.settings);
    }
} 