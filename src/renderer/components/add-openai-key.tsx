import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';

const AddOpenAIKey = () => {
  const [key, setKey] = useState('');
  const [version, setVersion] = useState('GPT-3.5');

  useEffect(() => {
    const getOpenAIKey = async () => {
      const openAIKey = (await window.electron.store.get(
        'openAIKey'
      )) as string;
      setKey(openAIKey);

      const openAIVersion = (await window.electron.store.get(
        'gptVersion'
      )) as string;

      setVersion(openAIVersion);
    };

    getOpenAIKey();
  }, []);

  const { toast } = useToast();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    await window.electron.store.set('openAIKey', key);
    await window.electron.store.set('gptVersion', version);
    toast({
      title: 'OpenAI key saved',
      description: 'You can now use OpenAI API',
    });
  };

  return (
    <div className="flex flex-col items-center h-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 my-auto h-full justify-center w-80 mt-4"
      >
        <h1 className="text-center">Add OpenAI API Key</h1>
        <Label>OpenAI Key</Label>
        <Input
          autoFocus
          required
          spellCheck={false}
          name="OpenAI Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <Label>GPT Version</Label>
        <Select
          value={version}
          onValueChange={(val: string) => setVersion(val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a GPT version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
            <SelectItem value="GPT-4">GPT-4</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
};

export default AddOpenAIKey;
