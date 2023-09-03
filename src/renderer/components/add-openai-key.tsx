import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

const AddOpenAIKey = () => {
  const [key, setKey] = useState('');

  useEffect(() => {
    const getOpenAIKey = async () => {
      const openAIKey = (await window.electron.store.get(
        'openAIKey'
      )) as string;
      setKey(openAIKey);
    };

    getOpenAIKey();
  }, []);

  const { toast } = useToast();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    window.electron.store.set('openAIKey', key);
    toast({
      title: 'OpenAI key saved',
      description: 'You can now use OpenAI API',
    });
  };

  return (
    <div className="flex flex-col items-center h-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 my-auto h-full justify-center w-80"
      >
        <h1 className="text-center">Add OpenAI API Key</h1>
        <Input
          autoFocus
          required
          name="OpenAI Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
};

export default AddOpenAIKey;
