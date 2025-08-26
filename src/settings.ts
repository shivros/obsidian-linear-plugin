export interface LinearIntegration {
    name: string;
    apiKey: string;
}

export interface LinearPluginSettings {
    integrations: LinearIntegration[];
    defaultIntegration: string;
    debugMode: boolean;
}

export const DEFAULT_SETTINGS: LinearPluginSettings = {
    integrations: [{ name: 'default', apiKey: '' }],
    defaultIntegration: 'default',
    debugMode: false
};
