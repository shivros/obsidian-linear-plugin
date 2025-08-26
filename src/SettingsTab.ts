import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import LinearPlugin from './main';
import { LinearIntegration } from './settings';

export class LinearSettingsTab extends PluginSettingTab {
    plugin: LinearPlugin;

    constructor(app: App, plugin: LinearPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    private createUniqueName(): string {
        let index = 1;
        let name = `integration-${index}`;
        const names = this.plugin.settings.integrations.map(i => i.name);
        while (names.includes(name)) {
            index++;
            name = `integration-${index}`;
        }
        return name;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        const integrationsEl = containerEl.createDiv();
        const defaultEl = containerEl.createDiv();

        const renderDefault = () => {
            defaultEl.empty();
            new Setting(defaultEl)
                .setName('Default integration')
                .setDesc('Used when no integration is specified in a code block')
                .addDropdown(drop => {
                    for (const integ of this.plugin.settings.integrations) {
                        drop.addOption(integ.name, integ.name);
                    }
                    drop.setValue(this.plugin.settings.defaultIntegration)
                        .onChange(async value => {
                            this.plugin.settings.defaultIntegration = value;
                            await this.plugin.saveSettings();
                        });
                });
        };

        const renderIntegrations = () => {
            integrationsEl.empty();
            this.plugin.settings.integrations.forEach((integration, index) => {
                const setting = new Setting(integrationsEl)
                    .setName(integration.name)
                    .addText(text => text
                        .setPlaceholder('Name')
                        .setValue(integration.name)
                        .onChange(async value => {
                            value = value.trim();
                            if (!value) {
                                new Notice('Integration name cannot be empty');
                                text.setValue(integration.name);
                                return;
                            }
                            if (this.plugin.settings.integrations.some((i, idx) => i.name === value && idx !== index)) {
                                new Notice('Integration names must be unique');
                                text.setValue(integration.name);
                                return;
                            }
                            integration.name = value;
                            if (this.plugin.settings.defaultIntegration === this.plugin.settings.integrations[index].name) {
                                this.plugin.settings.defaultIntegration = value;
                            }
                            await this.plugin.saveSettings();
                            renderIntegrations();
                            renderDefault();
                        }))
                    .addText(text => text
                        .setPlaceholder('API key')
                        .setValue(integration.apiKey)
                        .onChange(async value => {
                            integration.apiKey = value;
                            await this.plugin.saveSettings();
                        }))
                    .addExtraButton(btn => btn
                        .setIcon('trash')
                        .setTooltip('Delete integration')
                        .onClick(async () => {
                            this.plugin.settings.integrations.splice(index, 1);
                            if (this.plugin.settings.defaultIntegration === integration.name) {
                                this.plugin.settings.defaultIntegration = this.plugin.settings.integrations[0]?.name || 'default';
                            }
                            await this.plugin.saveSettings();
                            renderIntegrations();
                            renderDefault();
                        }));
            });
        };

        new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('Add integration')
                .onClick(async () => {
                    const name = this.createUniqueName();
                    this.plugin.settings.integrations.push({ name, apiKey: '' });
                    await this.plugin.saveSettings();
                    renderIntegrations();
                    renderDefault();
                }));

        renderIntegrations();
        renderDefault();

        new Setting(containerEl)
            .setName('Debug mode')
            .setDesc('Enable debug logging in the console')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.debugMode)
                .onChange(async value => {
                    this.plugin.settings.debugMode = value;
                    await this.plugin.saveSettings();
                }));
    }
}
