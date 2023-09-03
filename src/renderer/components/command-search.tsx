import { useState, useEffect } from 'react';
import { ArrowBigLeft } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import DataQuestionLogo from '../../../assets/dataquestion.svg';
import PostgresSchemaComponent from './add-postgres-schema';
import QueryGenerator from './query-generator';
import Addopenaikey from './add-openai-key';

enum CommandPage {
  SearchDatabases,
  ManageSchema,
  DeleteDatabase,
  AddPostgresSchema,
  GenerateQuery,
  License,
  AddOpenAIKey,
}

interface FakeInputProps {
  onClick: () => void;
}

const FakeInput = ({ onClick }: FakeInputProps) => {
  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <ArrowBigLeft
        className="mr-2 h-5 w-5 shrink-0 opacity-50 cursor-pointer hover:opacity-100"
        onClick={onClick}
      />
      <div className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
    </div>
  );
};

const INPUT_DISABLED_FOR_PAGES = [
  CommandPage.AddPostgresSchema,
  CommandPage.GenerateQuery,
  CommandPage.AddOpenAIKey,
];

function CommandSearch() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [pages, setPages] = useState<CommandPage[]>([]);
  const page = pages.length > 0 ? pages[pages.length - 1] : undefined;

  const [databaseName, setDatabaseName] = useState('');

  const searchDisabled = page ? INPUT_DISABLED_FOR_PAGES.includes(page) : false;

  const goBack = () => {
    setPages((pg) => pg.slice(0, -1));
  };

  const goNext = (next: CommandPage) => {
    setPages((pg) => [...pg, next]);
    setSearch('');
  };

  const [databases, setDatabases] = useState<any[]>([]);

  useEffect(() => {
    const fetchDatabases = async () => {
      const dbList = await window.electron.store.get('databaseList');
      setDatabases(dbList);
    };

    fetchDatabases();
  }, []);

  const deleteDatabase = (databaseName: string) => {
    // show confirmation dialog
    const confirmation = window.electron.dialog.showMessageBox({
      type: 'warning',
      buttons: ['Delete', 'Cancel'],
      title: 'Delete database',
      message: `Are you sure you want to delete ${databaseName}?`,
    });

    // if user cancels, return
    if (confirmation === 1) {
      return;
    }

    // first delete schema from database
    // fire and forget deletion
    window.electron.store
      .delete(`databaseSchemas.${databaseName}`)
      .catch(() => {
        window.electron.dialog.showErrorBox(
          'Error',
          'Failed to delete database schema'
        );
      });

    // delete from the list of databases
    window.electron.store
      .get('databaseList')
      .then((databaseList: any[]) => {
        const newDatabaseList = databaseList.filter(
          (database) => database.name !== databaseName
        );
        return newDatabaseList;
      })
      .then((newDatabaseList: any[]) => {
        window.electron.store.set('databaseList', newDatabaseList);
        setDatabases(newDatabaseList);
        return newDatabaseList;
      })
      .catch(() => {
        window.electron.dialog.showErrorBox(
          'Error',
          'Failed to update database list'
        );
      });

    // show success message
    window.electron.dialog.showMessageBox({
      type: 'info',
      buttons: ['OK'],
      title: 'Database deleted!',
      message: `Deletion of ${databaseName} was successful`,
    });

    // go back to previous page
    goBack();
  };

  return (
    <Command
      autoFocus
      onKeyDown={(e) => {
        // Escape goes to previous page
        // Backspace goes to previous page when search is empty

        if (searchDisabled) {
          return;
        }

        if (e.key === 'Escape' || (e.key === 'Backspace' && !search)) {
          e.preventDefault();
          setPages((pg) => pg.slice(0, -1));
        }
      }}
    >
      {searchDisabled ? (
        <FakeInput onClick={goBack} />
      ) : (
        <CommandInput
          value={search}
          onValueChange={setSearch}
          autoFocus
          placeholder="Search or press backspace to go back"
        />
      )}
      <CommandList className="max-h-full">
        {page === undefined && (
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Databases">
              <CommandItem onSelect={() => goNext(CommandPage.SearchDatabases)}>
                Search databases
              </CommandItem>
              <CommandItem onSelect={() => goNext(CommandPage.ManageSchema)}>
                Manage schemas
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => goNext(CommandPage.License)}>
                License
              </CommandItem>
              <CommandItem onSelect={() => goNext(CommandPage.AddOpenAIKey)}>
                Add OpenAI key
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {page === CommandPage.SearchDatabases && (
          <>
            <CommandEmpty>No results found.</CommandEmpty>
            {databases.map((database) => (
              <CommandItem
                key={database.name}
                onSelect={() => {
                  setDatabaseName(database.name);
                  goNext(CommandPage.GenerateQuery);
                }}
              >
                {database.name}
              </CommandItem>
            ))}
          </>
        )}

        {page === CommandPage.License && (
          <>
            <CommandItem>Activate License</CommandItem>
            <CommandItem>Deactivate License</CommandItem>
          </>
        )}

        {page === CommandPage.ManageSchema && (
          <>
            <CommandItem
              onSelect={() => {
                goNext(CommandPage.AddPostgresSchema);
              }}
            >
              Add new Postgres schema
            </CommandItem>
            <CommandItem
              onSelect={() => {
                goNext(CommandPage.DeleteDatabase);
              }}
            >
              Delete Database
            </CommandItem>
          </>
        )}

        {page === CommandPage.AddPostgresSchema && <PostgresSchemaComponent />}

        {page === CommandPage.DeleteDatabase && (
          <>
            {databases.map((database) => (
              <CommandItem
                key={database.name}
                onSelect={async () => deleteDatabase(database.name)}
              >
                {database.name}
              </CommandItem>
            ))}
          </>
        )}

        {page === CommandPage.GenerateQuery && (
          <QueryGenerator databaseName={databaseName} />
        )}

        {page === CommandPage.AddOpenAIKey && <Addopenaikey />}
      </CommandList>

      <div cmdk-dataquestion-footer="">
        <a href="https://dataquestion.io" target="_blank" rel="noreferrer">
          <img src={DataQuestionLogo} alt="DataQuestion" width={120} />
        </a>

        <hr />
      </div>
    </Command>
  );
}

export default CommandSearch;
