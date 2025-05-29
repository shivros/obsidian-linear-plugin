import { LinearClient, Issue } from "@linear/sdk";
import { useSettingsStore } from "@/settings";
import { Notice } from "obsidian";

export class LinearService {
  private client: LinearClient | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const settings = useSettingsStore.getState();
    if (settings.linearApiKey) {
      this.client = new LinearClient({ apiKey: settings.linearApiKey });
    }
  }

  public async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new LinearClient({ apiKey });
      const me = await testClient.viewer;
      return !!me;
    } catch (error) {
      return false;
    }
  }

  public async getTeams() {
    if (!this.client) {
      new Notice("Linear API key not configured");
      return [];
    }

    try {
      const teams = await this.client.teams();
      return teams.nodes;
    } catch (error) {
      console.error("Error fetching teams:", error);
      new Notice("Failed to fetch Linear teams");
      return [];
    }
  }

  public async getProjects(teamId: string) {
    if (!this.client) {
      new Notice("Linear API key not configured");
      return [];
    }

    try {
      const team = await this.client.team(teamId);
      if (!team) {
        new Notice("Team not found");
        return [];
      }
      const projects = await team.projects();
      return projects.nodes;
    } catch (error) {
      console.error("Error fetching projects:", error);
      new Notice("Failed to fetch Linear projects");
      return [];
    }
  }

  public async getLabels(teamId: string) {
    if (!this.client) {
      new Notice("Linear API key not configured");
      return [];
    }

    try {
      const labels = await this.client.issueLabels({
        filter: {
          team: {
            id: { eq: teamId }
          }
        }
      });
      return labels.nodes;
    } catch (error) {
      console.error("Error fetching labels:", error);
      new Notice("Failed to fetch Linear labels");
      return [];
    }
  }

  public async createIssue(params: {
    title: string;
    description: string;
    teamId: string;
    projectId?: string;
    labelIds?: string[];
  }): Promise<Issue | null> {
    if (!this.client) {
      new Notice("Linear API key not configured");
      return null;
    }

    try {
      const response = await this.client.createIssue(params);
      return response.issue || null;
    } catch (error) {
      console.error("Error creating issue:", error);
      new Notice("Failed to create Linear issue");
      return null;
    }
  }

  public async getIssue(issueId: string): Promise<Issue | null> {
    if (!this.client) {
      new Notice("Linear API key not configured");
      return null;
    }

    try {
      const issue = await this.client.issue(issueId);
      return issue || null;
    } catch (error) {
      console.error("Error fetching issue:", error);
      new Notice("Failed to fetch Linear issue");
      return null;
    }
  }
} 