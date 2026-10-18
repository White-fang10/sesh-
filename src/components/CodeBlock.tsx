import React, { useState } from 'react';
import { Copy, Check, Terminal, Trash2 } from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'bash', label: 'Bash / Shell' },
  { id: 'html', label: 'HTML / CSS' },
  { id: 'json', label: 'JSON' },
  { id: 'sql', label: 'SQL' },
  { id: 'rust', label: 'Rust' },
  { id: 'go', label: 'Go' },
  { id: 'cpp', label: 'C / C++' },
  { id: 'java', label: 'Java' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'text', label: 'Plain Text' },
];

export function parseContentWithCodeBlocks(content: string): { type: 'text' | 'code'; content: string; language?: string }[] {
  if (!content || !content.includes('```')) {
    return [{ type: 'text', content: content || '' }];
  }
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.substring(lastIndex) });
  }
  return parts;
}

interface CodeBlockDisplayProps {
  code: string;
  language?: string;
  compact?: boolean;
}

export const CodeBlockDisplay: React.FC<CodeBlockDisplayProps> = ({
  code,
  language = 'javascript',
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple token-based color styling for common code patterns
  const renderHighlightedLine = (line: string) => {
    // Comment line
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return <span className="text-emerald-400 font-mono italic">{line}</span>;
    }

    // Command prompts
    if (line.trim().startsWith('$') || line.trim().startsWith('>')) {
      return (
        <span className="font-mono">
          <span className="text-amber-400 font-bold">{line.substring(0, 1)}</span>
          <span className="text-slate-200">{line.substring(1)}</span>
        </span>
      );
    }

    // Split words to highlight keywords, strings, and standard text
    const parts = line.split(/('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`|\b(?:const|let|var|function|return|if|else|for|while|import|from|export|default|class|def|async|await|try|catch|throw|new|typeof|interface|type|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|docker|npm|git|cd|ls|mkdir|curl|echo)\b)/g);

    return (
      <span className="font-mono">
        {parts.map((part, i) => {
          if (!part) return null;
          // String literal
          if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'")) || (part.startsWith('`') && part.endsWith('`'))) {
            return <span key={i} className="text-sky-300">{part}</span>;
          }
          // Keywords
          if (/^(const|let|var|function|return|if|else|for|while|import|from|export|default|class|def|async|await|try|catch|throw|new|typeof|interface|type)$/.test(part)) {
            return <span key={i} className="text-rose-400 font-semibold">{part}</span>;
          }
          // CLI commands or SQL keywords
          if (/^(docker|npm|git|cd|ls|mkdir|curl|echo|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN)$/.test(part)) {
            return <span key={i} className="text-amber-300 font-semibold">{part}</span>;
          }
          return <span key={i} className="text-slate-200">{part}</span>;
        })}
      </span>
    );
  };

  const lines = code.split('\n');

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-full rounded-xl bg-[#0F141C] text-slate-200 border border-slate-800/90 shadow-inner overflow-hidden font-mono select-text my-2.5 ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
    >
      {/* Top Header Bar with Mac-style window controls and language indicator */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#171E2B] border-b border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-2">
          {/* 3 Terminal dots */}
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 ml-1 text-slate-400 font-medium text-[10px] uppercase tracking-wider">
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>{language || 'code'}</span>
          </div>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-700/60 text-slate-400 hover:text-white transition cursor-pointer text-[10px]"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body with line numbers */}
      <div className="p-3 overflow-x-auto max-h-72 custom-scrollbar space-y-0.5">
        {lines.map((line, idx) => (
          <div key={idx} className="flex gap-3 leading-relaxed">
            <span className="text-slate-600 select-none text-right w-5 shrink-0 text-[10px] pt-0.5">
              {idx + 1}
            </span>
            <div className="flex-1 whitespace-pre">{renderHighlightedLine(line)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CodeBlockEditorProps {
  code: string;
  language: string;
  onChangeCode: (code: string) => void;
  onChangeLanguage: (lang: string) => void;
  onRemove: () => void;
}

export const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  code,
  language,
  onChangeCode,
  onChangeLanguage,
  onRemove,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enable tab indentation inside code editor
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#0F141C] border border-slate-800/90 shadow-md overflow-hidden text-slate-200 my-3 animate-in fade-in">
      {/* Code block editor header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#171E2B] border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#FFBF24]" />
          <span className="text-xs font-bold text-slate-200 font-heading">Code Block</span>

          {/* Language selector dropdown */}
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="ml-2 bg-[#0F141C] text-xs text-amber-400 font-mono font-medium rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Remove code block button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
          title="Remove Code Block"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Monospace Code Editor Textarea */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="// Paste or write your code here... (Tab key supported)"
          rows={Math.max(4, Math.min(14, code.split('\n').length + 1))}
          className="w-full p-3.5 bg-transparent font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Editor footer */}
      <div className="px-3 py-1 bg-[#121824] border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>{language.toUpperCase()}</span>
        <span>{code.split('\n').length} lines &bull; {code.length} chars</span>
      </div>
    </div>
  );
};
