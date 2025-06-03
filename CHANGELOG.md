# Changelog

## [1.1.0] - 2025

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

### Fixed
- Date sorting now properly handles issues without due dates
- Build configuration and entry points
- TypeScript type errors in LinearService and main components
- Console logging now respects debug mode setting

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