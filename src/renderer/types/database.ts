type Id = string;

export enum Engine {
  MySQL = 'MYSQL',
  PostgreSQL = 'POSTGRESQL',
  MSSQL = 'MSSQL',
}

export type DatabaseType = 'MySQL' | 'PostgreSQL' | 'MSSQL';

export const DatabaseTypeMap: Record<Engine, DatabaseType> = {
  [Engine.MySQL]: 'MySQL',
  [Engine.PostgreSQL]: 'PostgreSQL',
  [Engine.MSSQL]: 'MSSQL',
};

export interface SSLOptions {
  ca?: string;
  cert?: string;
  key?: string;
}

export interface DbSchema {
  [key: string]: string;
}

export interface StoreDbSchema {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

export interface Connection {
  id?: string;
  title: string;
  engineType: Engine;
  host: string;
  port: string;
  username: string;
  password: string;
  // database is only required for PostgreSQL.
  database?: string;
  // encrypt is only required for MSSQL.
  encrypt?: boolean;
  ssl?: SSLOptions;
}

export type RawResult = {
  [key: string]: any;
};

export interface ExecutionResult {
  rawResult: RawResult[];
  rowCount?: number;
  affectedRows?: number;
  error?: string;
}

export interface Connector {
  testConnection: () => Promise<boolean>;
  execute: (
    databaseName: string,
    statement: string
  ) => Promise<ExecutionResult>;
  getDatabases: () => Promise<string[]>;
  getTables: (databaseName: string) => Promise<string[]>;
  getTableStructure: (
    databaseName: string,
    tableName: string,
    structureFetched: (tableName: string, structure: string) => void
  ) => Promise<void>;
  getTableStructureBatch: (
    databaseName: string,
    tableNameList: string[],
    structureFetched: (tableName: string, structure: string) => void
  ) => Promise<void>;
}

export interface Database {
  connectionId: Id;
  name: string;
  tableList: Table[];
}

export interface Table {
  name: string;
  // structure is a string of the table structure.
  // It's mainly used for providing a chat context for the assistant.
  structure: string;
}
