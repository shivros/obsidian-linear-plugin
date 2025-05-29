import { type Settings, useSettingsStore } from "@/settings";
import { App, Editor, MarkdownView, type MarkdownFileInfo, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { LinearService } from './services/linear';
import type { Team, Project, IssueLabel } from '@linear/sdk';

// Remember to rename these classes and interfaces!

interface LinearPluginSettings extends Settings {}

export default class LinearPlugin extends Plugin {
  private linearService!: LinearService;
  settings!: LinearPluginSettings;

  async onload() {
    this.settings = useSettingsStore.getState();
    this.linearService = new LinearService();

    // Add a command to create a new Linear issue
    this.addCommand({
      id: 'create-linear-issue',
      name: 'Create Linear Issue',
      editorCallback: async (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
        if (!(ctx instanceof MarkdownView)) return;
        
        const selection = editor.getSelection();
        const settings = useSettingsStore.getState();

        if (!settings.linearApiKey || !settings.defaultTeamId) {
          new Notice('Please configure Linear API key and default team in settings');
          return;
        }

        try {
          const issue = await this.linearService.createIssue({
            title: selection.split('\n')[0] || 'New Issue',
            description: selection || '',
            teamId: settings.defaultTeamId,
            projectId: settings.defaultProjectId || undefined,
            labelIds: settings.defaultLabelIds || undefined,
          });

          if (issue) {
            new Notice(`Created Linear issue: ${issue.title}`);
            // Insert the issue URL at the cursor position
            editor.replaceSelection(`[${issue.title}](${issue.url})`);
          }
        } catch (error) {
          console.error('Error creating Linear issue:', error);
          new Notice('Failed to create Linear issue');
        }
      }
    });

    // Add a ribbon icon
    const ribbonIconEl = this.addRibbonIcon('list-checks', 'Linear', (evt: MouseEvent) => {
      new Notice('Linear plugin is active!');
    });

    // Add settings tab
    this.addSettingTab(new LinearSettingTab(this.app, this));
  }

  onunload() {
    // Clean up plugin resources
  }
}

class LinearSettingTab extends PluginSettingTab {
  plugin: LinearPlugin;

  constructor(app: App, plugin: LinearPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display() {
    const { containerEl } = this;
    const settings = useSettingsStore.getState();

    containerEl.empty();
    containerEl.createEl('h2', { text: 'Linear Settings' });

    new Setting(containerEl)
      .setName('Linear API Key')
      .setDesc('Your Linear API key')
      .addText(text => text
        .setPlaceholder('Enter your API key')
        .setValue(settings.linearApiKey)
        .onChange(async (value) => {
          useSettingsStore.setState({ linearApiKey: value });
          await this.plugin.saveData(settings);
        }));

    const linearService = new LinearService();
    const teams = await linearService.getTeams();

    new Setting(containerEl)
      .setName('Default Team')
      .setDesc('Select default team for new issues')
      .addDropdown(dropdown => {
        teams.forEach((team: Team) => {
          dropdown.addOption(team.id, team.name);
        });
        dropdown.setValue(settings.defaultTeamId);
        dropdown.onChange(async (value) => {
          useSettingsStore.setState({ defaultTeamId: value });
          await this.plugin.saveData(settings);
        });
      });

    if (settings.defaultTeamId) {
      const projects = await linearService.getProjects(settings.defaultTeamId);
      new Setting(containerEl)
        .setName('Default Project')
        .setDesc('Select default project for new issues')
        .addDropdown(dropdown => {
          projects.forEach((project: Project) => {
            dropdown.addOption(project.id, project.name);
          });
          dropdown.setValue(settings.defaultProjectId);
          dropdown.onChange(async (value) => {
            useSettingsStore.setState({ defaultProjectId: value });
            await this.plugin.saveData(settings);
          });
        });

      const labels = await linearService.getLabels(settings.defaultTeamId);
      new Setting(containerEl)
        .setName('Default Labels')
        .setDesc('Select default labels for new issues')
        .addDropdown(dropdown => {
          labels.forEach((label: IssueLabel) => {
            dropdown.addOption(label.id, label.name);
          });
          dropdown.setValue(settings.defaultLabelIds[0] || '');
          dropdown.onChange(async (value) => {
            useSettingsStore.setState({ defaultLabelIds: value ? [value] : [] });
            await this.plugin.saveData(settings);
          });
        });
    }
  }
}
