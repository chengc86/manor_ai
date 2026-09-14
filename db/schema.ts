import {integer,sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const accounts=sqliteTable('accounts',{id:text('id').primaryKey(),nickname:text('nickname').notNull().unique(),password:text('password').notNull(),salt:text('salt').notNull(),created:integer('created').notNull()});
export const sessions=sqliteTable('sessions',{token:text('token').primaryKey(),userId:text('user_id').notNull(),expires:integer('expires').notNull()},t=>[index('idx_sessions_user').on(t.userId)]);
export const world=sqliteTable('world',{id:text('id').primaryKey(),revision:integer('revision').notNull(),data:text('data').notNull()});
export const attempts=sqliteTable('auth_attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),reset:integer('reset').notNull()});
export const uploads=sqliteTable('uploads',{id:text('id').primaryKey(),userId:text('user_id').notNull(),name:text('name').notNull(),mime:text('mime').notNull(),created:integer('created').notNull()},t=>[index('idx_uploads_user_created').on(t.userId,t.created)]);
