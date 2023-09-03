import { Copy } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { LoadingButton } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from './ui/use-toast';
import { Badge } from './ui/badge';
import { getRelevantTablesPrompt, generateOpenAIPrompt } from '../lib/ai';
import { getSchema } from '../lib/schema';
import { complete, completeWithStreaming } from '../lib/utils';
import { DbSchema } from '../types';

const QueryGenerator = ({ databaseName }: { databaseName: string }) => {
  const [query, setQuery] = useState('Your generated query will be here');
  const [prompt, setPrompt] = useState('');
  const [tables, setTables] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const onCopyQuery = () => {
    window.electron.clipboard.writeText(query);
    toast({
      title: 'Query copied to clipboard',
      description: 'You can paste it in your database',
    });
  };

  async function onSubmit() {
    setIsGenerating(true);

    setProgress(5);

    setTables([]);

    try {
      // get schema in the right format
      const schema = await getSchema(databaseName);

      setProgress(10);

      // get relevant tables prompt
      const relevantTablesPrompt = getRelevantTablesPrompt(schema, prompt);

      // get relevant tables
      const relevantTables = await complete({
        prompt: relevantTablesPrompt,
      });

      setProgress(30);

      // convert relevant tables to array
      const relevantTablesArr = relevantTables
        .split(',')
        .filter((t) => t !== '');

      setTables(relevantTablesArr);

      const filteredSchema = relevantTablesArr.reduce((acc, curr) => {
        acc[curr.trim()] = schema[curr.trim()] as string;
        return acc;
      }, {} as DbSchema);

      setProgress(50);

      // get query prompt
      const queryPrompt = generateOpenAIPrompt(
        filteredSchema,
        prompt,
        'PostgreSQL' // TODO: make this dynamic
      );

      let tempQuery = '';

      setProgress(100);

      await completeWithStreaming({ prompt: queryPrompt }, (data: string) => {
        tempQuery += data;
        setQuery(tempQuery);
      });
    } catch (error) {
      window.electron.dialog.showErrorBox('Error', 'Failed to generate query');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }

  return (
    <div className="flex flex-col space-y-4 mt-2 px-2 max-h-screen">
      <div className="flex flex-row items-center justify-between">
        <Badge className="w-fit">{databaseName}</Badge>
        <div className="flex flex-row gap-2">
          {tables.map((table) => (
            <Badge key={table}>{table}</Badge>
          ))}
        </div>
      </div>
      <div className="grid h-full grid-cols-2 gap-2 max-h-full">
        <Textarea
          autoFocus
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask your data question here. Hit CMD+Enter to generate the query."
          className="h-full min-h-[300px] resize-none max-h-[300px] overflow-y-auto"
        />
        <div className="rounded-md border bg-muted max-h-full overflow-y-auto">
          <div className="flex flex-row items-start justify-between px-2 py-1 border-b">
            <span className="text-sm text-muted-foreground">{query}</span>
            <div className="flex-shrink-0">
              <Copy
                className="h-5 w-5 opacity-50 hover:opacity-100"
                onClick={onCopyQuery}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 justify-start">
        <LoadingButton loading={isGenerating} onClick={() => onSubmit()}>
          Generate
        </LoadingButton>
        {progress > 0 && <Progress className="w-96" value={progress} />}
      </div>
    </div>
  );
};

export default QueryGenerator;
