import { LinearClient, Issue, Team, WorkflowState, LinearRawResponse } from "@linear/sdk";
import { Notice } from "obsidian";

const log = (message: string, data?: any) => {
    const prefix = '🔄 Linear Plugin: ';
    if (data) {
        console.log(prefix + message, data);
    } else {
        console.log(prefix + message);
    }
};

interface WorkflowStateNode {
    id: string;
    name: string;
    type: string;
    team?: {
        id: string;
        name: string;
    };
}

interface GraphQLResponse<T> {
    data: T;
}

interface WorkflowStateQueryResponse {
    workflowStates: {
        nodes: WorkflowStateNode[];
        pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
        };
    };
}

export interface IssueOptions {
    limit?: number;
    teamName?: string;
    status?: string;
    assigneeEmail?: string;
}

export class LinearService {
    private client: LinearClient | null = null;
    private teamCache: Map<string, string> = new Map(); // name -> id mapping
    private workflowStatesCache: {
        timestamp: number;
        states: WorkflowStateNode[];
    } | null = null;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

    constructor(private apiKey: string) {
        if (apiKey) {
            this.client = new LinearClient({ apiKey });
            log('Service initialized with API key');
        } else {
            log('Service initialized without API key');
        }
    }

    private async ensureClient(): Promise<LinearClient> {
        if (!this.apiKey) {
            throw new Error("Linear API key not configured");
        }

        if (!this.client) {
            this.client = new LinearClient({ apiKey: this.apiKey });
            log('Created new Linear client');
        }

        return this.client;
    }

    async getTeams(): Promise<Team[]> {
        try {
            log('Fetching teams...');
            const client = await this.ensureClient();
            const { nodes } = await client.teams();
            log('Teams fetched:', nodes.map(t => ({ id: t.id, name: t.name })));
            return nodes;
        } catch (error) {
            console.error("Error fetching teams:", error);
            throw new Error("Failed to fetch teams");
        }
    }

    private async getTeamIdByName(teamName: string): Promise<string | null> {
        log(`Looking for team: "${teamName}"`);
        
        // Check cache first
        const cachedId = this.teamCache.get(teamName.toLowerCase());
        if (cachedId) {
            log(`Found team "${teamName}" in cache with ID: ${cachedId}`);
            return cachedId;
        }

        try {
            const teams = await this.getTeams();
            for (const team of teams) {
                const name = team.name.toLowerCase();
                this.teamCache.set(name, team.id); // Cache for future use
                if (name === teamName.toLowerCase()) {
                    log(`Found team "${teamName}" with ID: ${team.id}`);
                    return team.id;
                }
            }
            log(`Team "${teamName}" not found`);
            return null;
        } catch (error) {
            console.error("Error finding team:", error);
            return null;
        }
    }

    private isCacheValid(): boolean {
        return !!(
            this.workflowStatesCache &&
            Date.now() - this.workflowStatesCache.timestamp < this.CACHE_TTL
        );
    }

    async getWorkflowStates(): Promise<WorkflowStateNode[]> {
        try {
            // Check cache first
            if (this.isCacheValid()) {
                log('Using cached workflow states');
                return this.workflowStatesCache!.states;
            }

            log('Fetching workflow states...');
            const client = await this.ensureClient();
            let allStates: WorkflowStateNode[] = [];
            let hasNextPage = true;
            let after: string | null = null;

            while (hasNextPage) {
                const response: LinearRawResponse<WorkflowStateQueryResponse> = await client.client.rawRequest<WorkflowStateQueryResponse, { after?: string }>(`
                    query WorkflowStates${after ? '($after: String!)' : ''} {
                        workflowStates(first: 100${after ? ', after: $after' : ''}) {
                            nodes {
                                id
                                name
                                type
                                team {
                                    id
                                    name
                                }
                            }
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                        }
                    }
                `, after ? { after } : undefined);

                if (!response?.data?.workflowStates?.nodes) {
                    throw new Error("No workflow states returned from query");
                }

                const { nodes, pageInfo } = response.data.workflowStates;
                allStates = allStates.concat(nodes);
                hasNextPage = pageInfo.hasNextPage;
                after = pageInfo.endCursor;

                log(`Fetched ${nodes.length} workflow states${hasNextPage ? ', fetching more...' : ''}`);
            }

            // Update cache
            this.workflowStatesCache = {
                timestamp: Date.now(),
                states: allStates
            };

            log('All workflow states fetched:', allStates.map(s => ({
                id: s.id,
                name: s.name,
                team: s.team ? `${s.team.name} (${s.team.id})` : 'no team'
            })));
            
            return allStates;
        } catch (error) {
            console.error("Error fetching workflow states:", error);
            throw new Error("Failed to fetch workflow states");
        }
    }

    private normalizeStateName(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    private async getStatusByName(statusName: string, teamId?: string): Promise<WorkflowState | null> {
        log(`Looking for status: "${statusName}"${teamId ? ` in team ID: ${teamId}` : ''}`);

        try {
            const states = await this.getWorkflowStates();
            const normalizedSearchName = this.normalizeStateName(statusName);
            
            for (const state of states) {
                const normalizedStateName = this.normalizeStateName(state.name);
                
                log(`Checking state: "${state.name}" (${state.id})`, {
                    matches: {
                        name: normalizedStateName === normalizedSearchName,
                        team: !teamId || !state.team || state.team.id === teamId
                    },
                    state: {
                        name: state.name,
                        normalizedName: normalizedStateName,
                        id: state.id,
                        team: state.team ? `${state.team.name} (${state.team.id})` : 'no team'
                    }
                });
                
                // Match if:
                // 1. Names match (normalized)
                // 2. AND either:
                //    - No specific team is required, OR
                //    - The state belongs to the required team
                if (normalizedStateName === normalizedSearchName && 
                    (!teamId || !state.team || state.team.id === teamId)) {
                    log(`Found matching state: "${state.name}"`);
                    return state as unknown as WorkflowState;
                }
            }
            
            log(`No matching state found for "${statusName}"`);
            return null;
        } catch (error) {
            console.error("Error finding status:", error);
            return null;
        }
    }

    async getIssues(options?: IssueOptions): Promise<Issue[]> {
        try {
            log('Getting issues with options:', options);
            
            const client = await this.ensureClient();
            let teamId: string | undefined = undefined;
            const filter: any = {};

            if (options?.teamName) {
                const fetchedTeamId = await this.getTeamIdByName(options.teamName);
                if (!fetchedTeamId) {
                    log(`Team "${options.teamName}" not found`);
                    new Notice(`Team "${options.teamName}" not found`);
                    return [];
                }
                teamId = fetchedTeamId;
                filter.team = { id: { eq: teamId } };
                log(`Added team filter:`, filter.team);
            }

            if (options?.status) {
                const state = await this.getStatusByName(options.status, teamId);
                if (!state) {
                    const message = `Status "${options.status}" not found${teamId ? ' for the specified team' : ''}`;
                    log(message);
                    new Notice(message);
                    return [];
                }
                filter.state = { id: { eq: state.id } };
                log(`Added status filter:`, filter.state);
            }

            if (options?.assigneeEmail) {
                filter.assignee = { email: { eq: options.assigneeEmail } };
                log(`Added assignee filter:`, filter.assignee);
            }

            log('Fetching issues with filter:', filter);
            const { nodes } = await client.issues({
                first: options?.limit,
                filter: Object.keys(filter).length > 0 ? filter : undefined,
                orderBy: undefined
            });
            
            log(`Found ${nodes.length} issues`);
            return nodes;
        } catch (error) {
            console.error("Error fetching Linear issues:", error);
            new Notice("Failed to fetch Linear issues");
            return [];
        }
    }
} 