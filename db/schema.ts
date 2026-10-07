import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const eventWorkspaces = sqliteTable('event_workspaces', { id:text('id').primaryKey(), state:text('state').notNull(), revision:integer('revision').notNull().default(0), updatedAt:text('updated_at').notNull() });
export const screenSaves = sqliteTable('screen_saves', {id:text('id').primaryKey(), workspaceId:text('workspace_id').notNull(), payload:text('payload').notNull(), createdAt:text('created_at').notNull()}, t=>[index('idx_screen_saves_workspace_created').on(t.workspaceId,t.createdAt)]);
