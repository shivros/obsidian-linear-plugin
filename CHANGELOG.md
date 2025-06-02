# Changelog

## [1.1.0] - 2025

### Added
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
- Comprehensive debug logging with 🔄 prefix
- Status colors matching Linear workflow states
- Cache management for workflow states

### Fixed
- Date sorting now properly handles issues without due dates
- Build configuration and entry points
- TypeScript type errors in LinearService and main components

### Changed
- Reorganized project structure for better maintainability
- Improved error handling with detailed messages
- Enhanced status name matching (case-insensitive and special character handling)
- Updated documentation with all new features and options

### Developer Updates
- Added MIT License
- Improved package.json metadata
- Enhanced debugging capabilities
- Better error reporting for API interactions

## [1.0.0] - Initial Release
- Basic Linear integration
- Display issues in Obsidian
- Simple filtering options
- Basic error handling 