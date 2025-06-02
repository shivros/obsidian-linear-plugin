# Obsidian Linear Plugin

This plugin integrates Linear (https://linear.app) with Obsidian (https://obsidian.md), allowing you to embed and filter Linear issues directly in your notes.

## Features

### Display Options

You can customize how issues are displayed using options in the code block:

#### Limit Number of Issues

To limit the number of issues displayed, use the `limit` option:

```linear
limit: 5
```

This will show only the 5 most recent issues. If no limit is specified, all issues will be displayed.

#### Filter by Team

To show issues from a specific team, use the `team` option with the team's name:

```linear
team: Engineering
```

#### Filter by Status

To show issues with a specific status, use the `status` option with the status name:

```linear
status: In Progress
```

The status name matching is case-insensitive and forgiving of special characters, so "inprogress" and "In Progress" will work the same way.

#### Filter by Assignee

To show issues assigned to a specific person, use the `assignee` option with their email address:

```linear
assignee: user@example.com
```

You can combine multiple options:

```linear
team: Engineering
status: In Progress
assignee: user@example.com
limit: 3
```

This will show the 3 most recent In Progress issues from the Engineering team that are assigned to the specified user.

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