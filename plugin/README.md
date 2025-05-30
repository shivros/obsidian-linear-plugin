# Obsidian Linear Plugin

This plugin integrates Linear (https://linear.app) with Obsidian (https://obsidian.md), allowing you to embed and filter Linear issues directly in your notes.

## Features

### Status Filtering

You can filter Linear issues by their status using code blocks. The plugin supports status filtering with the following features:

- Filter issues by workflow status (e.g., Backlog, In Progress, Done)
- Automatic status name resolution with fuzzy matching
- Status-specific styling and colors
- Efficient caching system (5-minute TTL)
- Pagination support (100 states per page)

Example usage:

```linear
limit: 5
team: Infosec
status: Backlog
```

This will display up to 5 issues from the Infosec team that are in the Backlog status.

### Error Handling

The plugin includes comprehensive error handling:
- Detailed error messages showing both team and status context
- Graceful fallback for invalid status names
- Automatic status name normalization

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Linear"
4. Install the plugin and enable it

## Configuration

1. Get your Linear API key from Linear's settings
2. Open the plugin settings in Obsidian
3. Enter your Linear API key

## Development

### Prerequisites

- NodeJS v16 or higher
- npm or yarn

### Setup

1. Clone this repository
2. Run `npm install` or `yarn` to install dependencies
3. Run `npm run dev` to start compilation in watch mode

### Building

Run `npm run build` to create a production build. 