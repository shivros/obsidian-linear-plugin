# Changelog

## [1.1.2]
### Added
- New due date filters for `dueAfter` and `dueBefore` to narrow results to a specific window or day
- Support for fetching and embedding a Linear issue by its ID using a code block (`id: ISSUE_ID`).
  - Example:
    ````markdown
    ```linear
    id: LIN-123
    ```
    ````
  - You can also use `issueId` as the key.
  - This allows you to reference or embed individual issues from your team's projects directly into your Obsidian notes.
- Support for fetching and embedding multiple Linear issues by their IDs using a code block (`ids:` YAML array).
  - Example:
    ````markdown
    ```linear
    ids:
      - LIN-123
      - LIN-456
      - LIN-789
    ```
    ````
  - Each listed issue will be fetched and rendered in the order provided.

## [1.1.0]
### Added
- Debug mode toggle in settings
  - Control when debug logs appear in console
  - Cleaner console during normal operation
  - Detailed logging for troubleshooting
- Enhanced due date display with color-coded badges and emoji indicators:
  - 📅 Due Today (orange)
  - 📅 Due Tomorrow (blue)
  - ⚠️ Overdue (red)
  - 📅 Upcoming (green)
  - 📅 No due date (gray)
- New filtering and sorting options:
  - Sort by due date (ascending/descending)
  - Filter by team name
  - Filter by status
  - Filter by assignee email
  - Option to hide descriptions
- Markdown rendering for issue descriptions
  - Full support for Linear's markdown formatting
  - Clickable links
  - Code blocks
  - Lists and headers
- Status colors matching Linear workflow states
- Cache management for workflow states
- Enhanced error handling and logging
  - Better distinction between errors and expected conditions
  - Comprehensive debug logging with 🔄 prefix
  - Improved error messages and context

### Fixed
- Date sorting now properly handles issues without due dates
- Build configuration and entry points
- TypeScript type errors in LinearService and main components
- Console logging now respects debug mode setting
- Improved error message clarity
- Better error handling in UI components

### Changed
- Reorganized project structure for better maintainability
- Improved error handling with detailed messages
- Enhanced status name matching (case-insensitive and special character handling)
- Updated documentation with all new features and options
- Refined debug logging with clearer messages and better categorization
- Improved distinction between errors and expected conditions in logs

### Developer Updates
- Added MIT License
- Improved package.json metadata
- Enhanced debugging capabilities
- Better error reporting for API interactions
- Added comprehensive debug mode for development

## [1.0.0] - Initial Release
- Basic Linear integration
- Display issues in Obsidian
- Simple filtering options
- Basic error handling 