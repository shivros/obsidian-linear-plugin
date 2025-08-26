import { MarkdownPostProcessorContext, MarkdownRenderer, MarkdownRenderChild, App } from "obsidian";
import { LinearService, IssueOptions } from "../services/LinearService";
import type { Issue } from "@linear/sdk";
import { LinearPluginSettings } from '../settings';
import { parseYaml } from 'obsidian';

export class LinearProcessor extends MarkdownRenderChild {
    constructor(private settings: LinearPluginSettings, containerEl: HTMLElement, private app: App) {
        super(containerEl);
    }

    private log(message: string, data?: any, isError: boolean = false) {
        if (!this.settings.debugMode) return;
        
        const prefix = '🔄 Linear Plugin: ';
        if (isError) {
            console.error(prefix + message, data);
        } else {
            console.log(prefix + message, data || '');
        }
    }

    private parseOptions(source: string): IssueOptions {
        const options: IssueOptions = {};
        
        try {
            // Use parseYaml to parse the source
            const parsed = parseYaml(source.trim());
            this.log('Parsing options from YAML:', parsed);
            
            if (parsed && typeof parsed === 'object') {
                if (parsed.limit && typeof parsed.limit === 'number' && parsed.limit > 0) {
                    options.limit = parsed.limit;
                }
                
                if (parsed.team && typeof parsed.team === 'string') {
                    options.teamName = parsed.team;
                }
                
                if (parsed.status && typeof parsed.status === 'string') {
                    options.status = parsed.status;
                }
                
                if (parsed.assignee && typeof parsed.assignee === 'string') {
                    options.assigneeEmail = parsed.assignee;
                }

                if (parsed.integration && typeof parsed.integration === 'string') {
                    options.integration = parsed.integration;
                }
                
                if (parsed.sorting && typeof parsed.sorting === 'string') {
                    const sortValue = parsed.sorting.toLowerCase();
                    if (sortValue === 'date' || sortValue === 'datedescending') {
                        options.sorting = {
                            field: 'date',
                            direction: 'desc'
                        };
                    } else if (sortValue === 'dateascending') {
                        options.sorting = {
                            field: 'date',
                            direction: 'asc'
                        };
                    }
                }
                
                if (parsed.hideDescription && parsed.hideDescription === true) {
                    options.hideDescription = true;
                }
            }
            
            this.log('Final parsed options:', options);
        } catch (error) {
            // This is an actual error in parsing, so we'll log it as an error
            this.log("Failed to parse Linear block options", error, true);
        }

        return options;
    }

    private async renderIssue(container: HTMLDivElement, issue: Issue, options: IssueOptions, ctx: MarkdownPostProcessorContext) {
        this.log('Rendering issue:', {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            dueDate: issue.dueDate,
            formattedDueDate: issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'
        });

        try {
            const issueEl = container.createDiv({ cls: "linear-issue" });

            // Create issue header with number and title
            const headerEl = issueEl.createDiv({ cls: "linear-issue-header" });
            const link = headerEl.createEl("a", {
                cls: "linear-issue-title",
                href: issue.url,
                text: `${issue.identifier}: ${issue.title}`
            });
            link.setAttribute("target", "_blank");

            // Add metadata section for due date and other info
            const metadataEl = issueEl.createDiv({ cls: "linear-issue-metadata" });

            // Add due date if available
            if (issue.dueDate) {
                this.log('Processing due date:', issue.dueDate);
                const dueDate = new Date(issue.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                let dueDateText = '';
                let dueDateClass = '';
                
                if (dueDate.toDateString() === today.toDateString()) {
                    dueDateText = '📅 Due Today';
                    dueDateClass = 'due-today';
                } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                    dueDateText = '📅 Due Tomorrow';
                    dueDateClass = 'due-tomorrow';
                } else if (dueDate < today) {
                    dueDateText = `⚠️ Overdue: ${dueDate.toLocaleDateString()}`;
                    dueDateClass = 'overdue';
                } else {
                    dueDateText = `📅 Due: ${dueDate.toLocaleDateString()}`;
                    dueDateClass = 'upcoming';
                }

                this.log('Creating due date element:', {
                    text: dueDateText,
                    class: dueDateClass,
                    originalDate: issue.dueDate,
                    parsedDate: dueDate
                });

                metadataEl.createSpan({
                    cls: `linear-issue-due-date ${dueDateClass}`,
                    text: dueDateText
                });
            } else {
                this.log('No due date for issue');
                metadataEl.createSpan({
                    cls: 'linear-issue-due-date no-date',
                    text: '📅 No due date'
                });
            }

            // Add status if available
            if (issue.state) {
                const state = await issue.state;
                headerEl.createSpan({
                    cls: `linear-issue-status linear-status-${state.name.toLowerCase()}`,
                    text: state.name
                });
            }

            // Add description if available and not hidden
            if (!options.hideDescription && issue.description) {
                this.log('Rendering description', { 
                    hideDescription: options.hideDescription,
                    hasDescription: !!issue.description,
                    descriptionLength: issue.description?.length
                });
                const descriptionEl = issueEl.createDiv({ cls: "linear-issue-description" });
                await MarkdownRenderer.render(
                    this.app,
                    issue.description,
                    descriptionEl,
                    ctx.sourcePath,
                    this
                );
            } else {
                this.log('Skipping description', {
                    hideDescription: options.hideDescription,
                    hasDescription: !!issue.description,
                    reason: !issue.description ? 'no description' : 'hideDescription is true'
                });
            }
        } catch (error) {
            this.log('Failed to render issue', error, true);
            container.createDiv({
                cls: 'linear-error',
                text: `Failed to render issue ${issue.identifier}`
            });
        }
    }

    async process(source: string, el: HTMLDivElement, ctx: MarkdownPostProcessorContext) {
        this.log('Processing Linear block with source:', source);
        el.empty();
        el.createEl("p", { text: "Loading Linear issues..." });

        try {
            const options = this.parseOptions(source);
            this.log('Parsed options:', options);
            
            const integrationName = options.integration || this.settings.defaultIntegration;
            const integration = this.settings.integrations.find(i => i.name === integrationName);

            if (!integration) {
                el.empty();
                el.createDiv({
                    cls: 'linear-error',
                    text: `Integration "${integrationName}" not found.`
                });
                return;
            }

            if (!integration.apiKey) {
                el.empty();
                el.createDiv({
                    cls: 'linear-error',
                    text: `API key for integration "${integrationName}" is not configured.`
                });
                return;
            }

            const service = new LinearService(integration.apiKey, this.settings.debugMode);
            const { integration: _, ...serviceOptions } = options;
            const issues = await service.getIssues(serviceOptions);
            this.log('Fetched issues:', issues);

            el.empty();
            if (!issues.length) {
                const messages: string[] = [];
                if (options.teamName) messages.push(`team "${options.teamName}"`);
                if (options.status) messages.push(`status "${options.status}"`);
                if (options.assigneeEmail) messages.push(`assignee "${options.assigneeEmail}"`);
                if (options.sorting) messages.push(`sorted by ${options.sorting.field} ${options.sorting.direction}`);
                
                const message = messages.length 
                    ? `No issues found for ${messages.join(" and ")}` 
                    : "No issues found";
                this.log('No matching issues:', message);
                el.createEl("p", { text: message });
                return;
            }

            const container = el.createDiv({ cls: "linear-issues-container" });
            for (const issue of issues) {
                await this.renderIssue(container, issue, options, ctx);
            }
        } catch (error) {
            this.log('Failed to process Linear block', error, true);
            el.empty();
            el.createDiv({
                cls: 'linear-error',
                text: 'Error loading Linear issues. Please check the console for details.'
            });
        }
    }
} 