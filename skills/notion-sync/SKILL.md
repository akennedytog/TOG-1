# notion-sync Skill

Description:
Sync and interact with Notion pages and databases via your Internal Integration Token.

Commands:

1. `notion-sync list-databases`  
   Fetch and list all accessible databases in your workspace.

2. `notion-sync query [--database-id ID] [--filter FILTER_JSON]`  
   Query a specific database with an optional filter.

3. `notion-sync get-page [--page-id ID]`  
   Retrieve the content and properties of a Notion page.

4. `notion-sync update-page [--page-id ID] [--data DATA_JSON]`  
   Update page properties or content blocks.

Inputs:
- `NOTION_TOKEN` in `.env` (your Internal Integration Token)

Outputs:
- JSON responses printed to stdout

Examples:

  # List all databases
  > openclaw notion-sync list-databases

  # Query a database for pages where "Status" is "To Do"
  > openclaw notion-sync query --database-id abc123 --filter '{"property":"Status","select":{"equals":"To Do"}}'

  # Get a page content
  > openclaw notion-sync get-page --page-id def456

  # Update a page property
  > openclaw notion-sync update-page --page-id def456 --data '{"properties":{"Name":{"title":[{"text":{"content":"New Title"}}]}}}'

Dependencies:
- @notionhq/client
- dotenv
