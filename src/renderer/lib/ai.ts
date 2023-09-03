import { DbSchema, DatabaseType } from '../types';

export const generateOpenAIPrompt = (
  schema: DbSchema,
  prompt: string,
  type: DatabaseType
) => {
  const template = `
    You are a data analyst working at a company. You are given a ${type} database schema with the following tables:
    ===== SCHEMA START =====
    ${Object.keys(schema)
      .map((tableName) => {
        return schema[tableName];
      })
      .join('\n')}
    ===== SCHEMA END =====
      Your boss asks you to write a SQL query which will return the data satisfying the following inquery:
      "${prompt}"

      Please write the SQL query your boss asks for. It should be correct, correpsond to the schema above and ${type} syntax. Remember to use the correct table names and column names.
      Please wrap all table names and column names in quotes (e.g. "table_name" or "columnName").
      Pay extra attention to the quotes if you see a column name or table name in camelCase or e,g (it should be "emailVerified" in the result SQL query, not emailVerified or emailverified or "emailverified").
      Return only the SQL query, nothing else.
    `;
  return template;
};

export const getRelevantTablesPrompt = (schema: DbSchema, prompt: string) => {
  const template = `
    You are a data analyst working at a company. You are given a list of tables in a database schema:
    ===== LIST START =====
    ${Object.keys(schema)
      .map((tableName) => {
        return tableName;
      })
      .join('\n')}
    ===== LIST END =====
      Your boss asks you to point out the tables in the schema that are relevant to the following inquery (so that they can be used in a SQL query):
      "${prompt}"

      Please write the names of the tables that are relevant to the inquery. Return only the names of the tables, nothing else.
      Use the following format: "table1, table2, table3". If there are no relevant tables, return "none". Return only the names of the tables, nothing else.
      Max 5 tables.
    `;
  return template;
};

// get schema by database name

// const getSchema = (databaseName: string) => {
//   const schema = window.electron.store.get(`databaseSchemas.${databaseName}`);
// };
