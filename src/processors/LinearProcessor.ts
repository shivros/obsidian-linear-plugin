import { MarkdownPostProcessorContext } from "obsidian";
import { LinearService, IssueOptions } from "../services/LinearService";
import type { Issue, WorkflowState } from "@linear/sdk";

export class LinearProcessor {
    private linearService: LinearService;
    readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.linearService = new LinearService(apiKey);
    }

    private parseOptions(source: string): IssueOptions {
        const options: IssueOptions = {};
        
        try {
            // Split the source into lines and process each line
            const lines = source.trim().split('\n');
            for (const line of lines) {
                const [key, value] = line.split(':').map(s => s.trim());
                switch (key) {
                    case 'limit':
                        const limitValue = parseInt(value);
                        if (!isNaN(limitValue) && limitValue > 0) {
                            options.limit = limitValue;
                        }
                        break;
                    case 'team':
                        if (value) {
                            options.teamName = value;
                        }
                        break;
                    case 'status':
                        if (value) {
                            options.status = value;
                        }
                        break;
                    case 'assignee':
                        if (value) {
                            options.assigneeEmail = value;
                        }
                        break;
                    case 'sorting':
                        if (value) {
                            const sortValue = value.toLowerCase();
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
                        break;
                    case 'hideDescription':
                        if (value && value.toLowerCase() === 'true') {
                            options.hideDescription = true;
                        }
                        break;
                }
            }
        } catch (error) {
            console.error("Error parsing Linear block options:", error);
        }

        return options;
    }

    private async renderIssue(container: HTMLDivElement, issue: Issue, options: IssueOptions) {
        console.log('Rendering issue:', {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            dueDate: issue.dueDate,
            formattedDueDate: issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'
        });

        const issueEl = container.createDiv({ cls: "linear-issue" });

        // Create issue header with number and title
        const headerEl = issueEl.createDiv({ cls: "linear-issue-header" });
        const link = headerEl.createEl("a", {
            cls: "linear-issue-title",
            href: issue.url,
            text: `${issue.identifier}: ${issue.title}`
        });
        link.setAttribute("target", "_blank");

        // Add metadata section for due date and other info BEFORE status
        const metadataEl = issueEl.createDiv({ cls: "linear-issue-metadata" });

        // Add due date if available with a more detailed format
        if (issue.dueDate) {
            console.log('Processing due date:', issue.dueDate);
            const dueDate = new Date(issue.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            let dueDateText = '';
            let dueDateClass = '';
            
            // Format relative dates
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

            console.log('Creating due date element:', {
                text: dueDateText,
                class: dueDateClass,
                originalDate: issue.dueDate,
                parsedDate: dueDate,
                comparison: {
                    isToday: dueDate.toDateString() === today.toDateString(),
                    isTomorrow: dueDate.toDateString() === tomorrow.toDateString(),
                    isOverdue: dueDate < today
                }
            });

            // Add the due date text prominently
            const dueDateEl = metadataEl.createSpan({
                cls: `linear-issue-due-date ${dueDateClass}`,
                text: dueDateText
            });
        } else {
            console.log('Issue has no due date');
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
            issueEl.createDiv({
                cls: "linear-issue-description",
                text: issue.description
            });
        }
    }

    async process(source: string, el: HTMLDivElement, ctx: MarkdownPostProcessorContext) {
        try {
            console.log('Processing Linear block with source:', source);
            el.empty();
            el.createEl("p", { text: "Loading Linear issues..." });

            const options = this.parseOptions(source);
            console.log('Parsed options:', options);
            const issues = await this.linearService.getIssues(options);
            console.log('Fetched issues:', issues);

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
                console.log('No issues found:', message);
                el.createEl("p", { text: message });
                return;
            }

            const container = el.createDiv({ cls: "linear-issues-container" });
            for (const issue of issues) {
                await this.renderIssue(container, issue, options);
            }

        } catch (error) {
            console.error("Error processing Linear block:", error);
            el.empty();
            el.createEl("p", { text: "Error loading Linear issues" });
        }
    }
} 