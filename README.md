# Linear Plugin for Obsidian

This plugin integrates Linear (https://linear.app) with Obsidian (https://obsidian.md), allowing you to embed and filter Linear issues directly in your notes.

**Note: This plugin is currently desktop-only and does not support mobile devices.**

## Features

### Display Options

You can customize how issues are displayed using YAML options in the code block:

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

#### Sort by Due Date

To sort issues by their due date, use the `sorting` option:

```linear
sorting: dateascending   # Sort by due date, oldest first
sorting: datedescending  # Sort by due date, newest first
```

#### Hide Description

To show only issue titles without descriptions, use the `hideDescription` option:

```linear
hideDescription: true
```

### Combining Options

You can combine multiple options to create specific views:

```linear
team: Engineering
status: In Progress
assignee: user@example.com
sorting: dateascending
hideDescription: true
limit: 3
```

This will show the 3 oldest In Progress issues from the Engineering team that are assigned to the specified user, without descriptions.

### Visual Enhancements

#### Due Date Indicators

Issues display due dates with color-coded badges and emoji indicators:
- 📅 Due Today (orange)
- 📅 Due Tomorrow (blue)
- ⚠️ Overdue (red)
- 📅 Upcoming (green)
- 📅 No due date (gray)

#### Status Colors

Each status is displayed with a color-coded badge matching your Linear workflow states.

### Debug Mode

The plugin includes a debug mode that can be enabled in settings. When enabled, it provides comprehensive logging (prefixed with 🔄) in the developer console, helping you troubleshoot:
- Plugin initialization and settings changes
- API requests and responses
- Filter applications and option parsing
- Due date calculations
- Status matching
- Team identification
- Description rendering decisions

To use debug mode:
1. Open Obsidian Settings
2. Go to Community Plugins > Linear
3. Enable the "Debug Mode" toggle
4. Open the developer console (Ctrl+Shift+I or Cmd+Option+I)
5. Look for messages prefixed with 🔄

Debug logs are only shown when debug mode is enabled, keeping your console clean during normal operation.

### Error Handling

The plugin includes comprehensive error handling:
- Detailed error messages showing both team and status context
- Graceful fallback for invalid status names
- Automatic status name normalization
- Cache management for workflow states
- Clear distinction between expected conditions and actual errors

## Installation

**Requirements:**
- Obsidian Desktop (Mobile devices are not supported)

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Linear"
4. Install the plugin and enable it

## Configuration

1. Get your Linear API key from Linear's settings
2. Open the plugin settings in Obsidian
3. Enter your Linear API key
4. (Optional) Enable debug mode to see detailed logs in the developer console

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

### Testing

To test the plugin in Obsidian:
1. Build the plugin using `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to your Obsidian plugins directory
3. Enable the plugin in Obsidian
4. Create a code block with the language set to `linear`
5. Check the developer console (Ctrl+Shift+I or Cmd+Option+I) for debug logs 