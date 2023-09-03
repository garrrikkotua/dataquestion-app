import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import 'tailwindcss/tailwind.css';
import './App.css';
import CommandSearch from './components/command-search';
import { Toaster } from './components/ui/toaster';

function CommandMenu() {
  return (
    <div className="w-screen h-screen px-2 py-2 overflow-x-hidden">
      <CommandSearch />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CommandMenu />} />
      </Routes>
    </Router>
  );
}
