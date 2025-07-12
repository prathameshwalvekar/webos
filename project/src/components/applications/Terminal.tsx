import React, { useState, useRef, useEffect } from 'react';

const TerminalApp: React.FC = () => {
  const [history, setHistory] = useState<string[]>([
    'Ubuntu 24.04 LTS Web Terminal',
    'Type "help" for available commands.',
    ''
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands = {
    help: () => [
      'Available commands:',
      '  help     - Show this help message',
      '  clear    - Clear the terminal',
      '  ls       - List directory contents',
      '  pwd      - Show current directory',
      '  whoami   - Show current user',
      '  date     - Show current date and time',
      '  neofetch - Show system information',
      '  echo     - Echo text',
      ''
    ],
    clear: () => {
      setHistory([]);
      return [];
    },
    ls: () => ['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', ''],
    pwd: () => [`/home/user${currentDirectory === '~' ? '' : currentDirectory}`, ''],
    whoami: () => ['user', ''],
    date: () => [new Date().toString(), ''],
    neofetch: () => [
      '                    .-/+oossssoo+/-.',
      '                `:+ssssssssssssssssss+:`',
      '              -+ssssssssssssssssssyyssss+-',
      '            .ossssssssssssssssss dMMMNysssso.',
      '           /ssssssssssshdmmNNmmyNMMMMhssssss/',
      '          +ssssssssshmydMMMMMMMNddddyssssssss+',
      '         /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/',
      '        .ssssssssdMMMNhsssssssssshNMMMdssssssss.',
      '        +sssshhhyNMMNyssssssssssssyNMMMysssssss+',
      '        ossyNMMMNyMMhsssssssssssssshmmmhssssssso',
      '        ossyNMMMNyMMhsssssssssssssshmmmhssssssso',
      '        +sssshhhyNMMNyssssssssssssyNMMMysssssss+',
      '        .ssssssssdMMMNhsssssssssshNMMMdssssssss.',
      '         /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/',
      '          +sssssssssdmydMMMMMMMMddddyssssssss+',
      '           /ssssssssssshdmNNNNmyNMMMMhssssss/',
      '            .ossssssssssssssssss dMMMNysssso.',
      '             -+sssssssssssssssssyyyssss+-',
      '               `:+ssssssssssssssssss+:`',
      '                   .-/+oossssoo+/-.',
      '',
      'OS: Ubuntu 24.04 LTS (Web)',
      'Kernel: WebContainer 1.0.0',
      'Shell: bash 5.1.16',
      'Terminal: web-terminal',
      'CPU: Virtual CPU',
      'Memory: Unlimited',
      ''
    ]
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const command = currentInput.trim();
    const commandOutput = [`user@ubuntu:${currentDirectory}$ ${command}`];
    
    if (command) {
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      if (cmd === 'echo') {
        commandOutput.push(args.join(' '), '');
      } else if (commands[cmd as keyof typeof commands]) {
        const result = commands[cmd as keyof typeof commands]();
        commandOutput.push(...result);
      } else {
        // Send to backend
        try {
          const res = await fetch('https://webos-1.onrender.com/terminal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
          });
          const data = await res.json();
          if (data.stdout) commandOutput.push(data.stdout);
          if (data.stderr) commandOutput.push(data.stderr);
          commandOutput.push('');
        } catch (err) {
          commandOutput.push('Error connecting to backend.', '');
        }
      }
    } else {
      commandOutput.push('');
    }
    
    setHistory(prev => [...prev, ...commandOutput]);
    setCurrentInput('');
  };

  return (
    <div className="h-full bg-gray-900 text-green-400 font-mono text-sm">
      <div 
        ref={terminalRef}
        className="h-full overflow-auto p-4"
        onClick={() => document.getElementById('terminal-input')?.focus()}
      >
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-400">user@ubuntu:{currentDirectory}$ </span>
          <input
            id="terminal-input"
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-green-400 ml-1"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
};

export default TerminalApp;