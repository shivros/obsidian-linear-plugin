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
                }
            }
        } catch (error) {
            console.error("Error parsing Linear block options:", error);
        }

        return options;
    }

    private async renderIssue(container: HTMLElement, issue: Issue) {
        const issueEl = container.createDiv({ cls: "linear-issue" });

        // Create issue header with number and title
        const headerEl = issueEl.createDiv({ cls: "linear-issue-header" });
        const link = headerEl.createEl("a", {
            cls: "linear-issue-title",
            href: issue.url,
            text: `${issue.identifier}: ${issue.title}`
        });
        link.setAttribute("target", "_blank");

        // Add status if available
        if (issue.state) {
            const state = await issue.state;
            headerEl.createSpan({
                cls: `linear-issue-status linear-status-${state.name.toLowerCase()}`,
                text: state.name
            });
        }

        // Add description if available
        if (issue.description) {
            issueEl.createDiv({
                cls: "linear-issue-description",
                text: issue.description
            });
        }
    }

    async process(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        try {
            el.empty();
            el.createEl("p", { text: "Loading Linear issues..." });

            const options = this.parseOptions(source);
            const issues = await this.linearService.getIssues(options);

            el.empty();
            if (!issues.length) {
                const messages = [];
                if (options.teamName) messages.push(`team "${options.teamName}"`);
                if (options.status) messages.push(`status "${options.status}"`);
                
                el.createEl("p", { 
                    text: messages.length 
                        ? `No issues found for ${messages.join(" and ")}` 
                        : "No issues found" 
                });
                return;
            }

            const container = el.createDiv({ cls: "linear-issues-container" });
            for (const issue of issues) {
                await this.renderIssue(container, issue);
            }

        } catch (error) {
            console.error("Error processing Linear block:", error);
            el.empty();
            el.createEl("p", { text: "Error loading Linear issues" });
        }
    }
} 