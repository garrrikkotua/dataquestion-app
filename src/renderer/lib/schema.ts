import { DbSchema, StoreDbSchema } from '../types';

export const getSchema = async (databaseName: string): Promise<DbSchema> => {
  const schema = (await window.electron.store.get(
    `databaseSchemas.${databaseName}`
  )) as StoreDbSchema[];

  // we need to group by table name and for every table create a SQL create table statement

  const groupedSchema: DbSchema = {};

  schema.forEach((row) => {
    if (!groupedSchema[row.table_name]) {
      groupedSchema[row.table_name] = `CREATE TABLE ${row.table_name} (\n`;
    }
    groupedSchema[row.table_name] += `${row.column_name} ${row.data_type}${
      row.is_nullable === 'YES' ? ' NULL' : ' NOT NULL'
    },\n`;
  });

  // Append closing parenthesis to each table create statement
  Object.keys(groupedSchema).forEach((tableName) => {
    groupedSchema[tableName] += `);\n`;
  });

  return groupedSchema;
};
