import { Copy } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { LoadingButton } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from './ui/use-toast';
import { Badge } from './ui/badge';
import { randomChat } from '../lib/utils';

const QueryGenerator = ({ databaseName }: { databaseName: string }) => {
  const [query, setQuery] = useState('Your generated query will be here');
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

    // sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProgress(30);

    // sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProgress(60);

    // sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProgress(100);

    setIsGenerating(false);

    // // simulate streaming the query by updating the state every 100ms
    // const queryArray = QUERY.split('');
    let tempQuery = '';
    randomChat(42, (data: string) => {
      tempQuery += data;
      setQuery(tempQuery);
    });
  }

  return (
    <div className="flex flex-col space-y-4 mt-2 px-2 max-h-screen">
      <Badge className="w-fit">{databaseName}</Badge>
      <div className="grid h-full grid-cols-2 gap-2 max-h-full">
        <Textarea
          autoFocus
          placeholder="Ask your data question here. Hit CMD+Enter to generate the query."
          className="h-full min-h-[300px] resize-none max-h-[300px]"
        />
        <div className="rounded-md border bg-muted max-h-full">
          <div className="flex flex-row items-start justify-between px-2 py-1 border-b max-h-full">
            <span className="text-sm text-muted-foreground overflow-y-scroll max-h-full">
              {query}
            </span>
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
