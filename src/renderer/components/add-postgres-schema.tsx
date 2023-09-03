import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { LoadingButton, Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

function PostgresSchemaComponent() {
  const { toast } = useToast();

  const [query] = useState(
    `SELECT
        jsonb_agg(
            jsonb_build_object(
                'table_name', table_name,
                'column_name', column_name,
                'data_type', data_type,
                'is_nullable', is_nullable
            )
        ) AS schema_info
    FROM
        information_schema.columns
    WHERE
        table_schema = 'public';
    `
  );

  const [json, setJson] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  const handleCopyQuery = () => {
    window.electron.clipboard.writeText(query);
    toast({
      title: 'Query copied to clipboard',
      description: 'You can paste it in your database',
    });
  };

  const verifyAndStore = async () => {
    // check if database name not empty and not already exists

    if (databaseName.trim() === '') {
      window.electron.dialog.showErrorBox(
        'Error',
        'Database name cannot be empty'
      );
      return;
    }

    const databaseList = (await window.electron.store.get('databaseList')) as {
      name: string;
      type: string;
    }[];

    // check if database name already exists
    if (databaseList.some((db) => db.name === databaseName)) {
      window.electron.dialog.showErrorBox(
        'Error',
        'Database name already exists'
      );
      return;
    }

    let parsedJson: any;

    // check that JSON is array and it consists of objects with keys table_name, column_name, data_type, is_nullable
    try {
      parsedJson = JSON.parse(json);
      if (!Array.isArray(parsedJson)) {
        window.electron.dialog.showErrorBox('Error', 'JSON must be an array');
        return;
      }
      for (const obj of parsedJson) {
        if (
          typeof obj !== 'object' ||
          !obj.hasOwnProperty('table_name') ||
          !obj.hasOwnProperty('column_name') ||
          !obj.hasOwnProperty('data_type') ||
          !obj.hasOwnProperty('is_nullable')
        ) {
          window.electron.dialog.showErrorBox(
            'Error',
            'JSON objects must have keys: table_name, column_name, data_type, is_nullable'
          );
          return;
        }
      }
    } catch (error) {
      window.electron.dialog.showErrorBox('Error', 'Invalid JSON');
      return;
    }

    try {
      // store the database name and JSON
      window.electron.store.set(`databaseSchemas.${databaseName}`, parsedJson);

      // add the database name to the list of databases
      databaseList.push({ name: databaseName, type: 'postgres' });
      window.electron.store.set('databaseList', databaseList);
    } catch (error) {
      window.electron.dialog.showErrorBox(
        'Error',
        'Failed to store database schema'
      );
      return;
    }

    // show success message
    toast({
      title: 'Database schema added successfully!',
      description: 'You can now use it in your queries',
    });
  };

  const handleVerifyAndStore = () => {
    setIsLoading(true);
    verifyAndStore();
    setIsLoading(false);
  };

  useEffect(() => {
    // if license key is empty and one database is already added, disable the form
    const fetchDatabaseList = async () => {
      const databaseList = (await window.electron.store.get(
        'databaseList'
      )) as {
        name: string;
        type: string;
      }[];

      const licenseKey = (await window.electron.store.get(
        'isLicenseKeyValid'
      )) as boolean;

      if (databaseList.length > 0 && !licenseKey) {
        setIsEnabled(false);
      }
    };
    fetchDatabaseList();
  }, []);

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center h-full gap-2 mt-4">
        <h1 className="text-center">
          You can only add one database with the community version
        </h1>
        <Button>
          <a href="https://dataquestion.io" target="blank" rel="noreferrer">
            Get a Pro version
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center h-full mt-4">
      <div className="flex flex-col gap-2">
        <h2>1. Copy query and run it on your database</h2>
        <div className="flex flex-row gap-2">
          <Textarea value={query} className="w-80" disabled />
          <Copy
            onClick={handleCopyQuery}
            className="hover:cursor-pointer opacity-50 hover:opacity-100"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2>2. Paste query output (your database schema)</h2>
        <Textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-80"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2>3. Add database name</h2>
        <Input
          className="w-80"
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
        />
      </div>
      <LoadingButton onClick={handleVerifyAndStore} loading={loading}>
        Verify and Save
      </LoadingButton>
    </div>
  );
}

export default PostgresSchemaComponent;
