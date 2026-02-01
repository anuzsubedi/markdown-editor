import { useState, useEffect, useRef } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import rehypeRaw from "rehype-raw";
import { 
  Printer, 
  Moon, 
  Sun, 
  Monitor, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Eye,
  EyeOff,
  Scissors
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const defaultMarkdown = `# Markdown Editor

Welcome to your new **Markdown Editor**! Use the split view to edit and preview in real-time.

## Features

- **Typography**: Support for **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

- **Syntax Highlighting**:



\`\`\`tsx

function HelloWorld() {

  return <h1>Hello, World!</h1>;

}

\`\`\`

- **Tables**:

| Feature | Status | Priority |
| :--- | :---: | ---: |
| WYSIWYG | Yes | High |
| PDF Export | Yes | Medium |
| Dark Mode | Yes | Low |

- **Lists**:
  1. Ordered list item
  2. Another item
  - Unordered sub-list
  - Another sub-item
- **Blockquotes**:
  > "Simplicity is the ultimate sophistication." - Leonardo da Vinci

- **Links & Images**:
  [Check out React](https://react.dev)

  ![Random Image](https://picsum.photos/400/200)

Start typing to see your changes!
`;

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    setTimeout(() => {
      const printContent = document.getElementById("markdown-preview");
      if (printContent) {
        const originalContents = document.body.innerHTML;
        const printClone = printContent.cloneNode(true) as HTMLElement;
        
        const markdownElement = printClone.querySelector('[data-color-mode]');
        if (markdownElement) {
          markdownElement.setAttribute('data-color-mode', 'light');
        }
        
        document.body.innerHTML = "";
        document.body.appendChild(printClone);
        
        window.print();
        
        document.body.innerHTML = originalContents;
        
        if (isDark) {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
        }
        window.location.reload(); 
      }
    }, 100);
  };

  const insertPageBreak = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = markdown;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const pageBreak = '\n<div class="page-break"></div>\n';
    
    const newText = before + pageBreak + after;
    setMarkdown(newText);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + pageBreak.length, start + pageBreak.length);
    }, 0);
  };

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const effectiveTheme = (() => {
    if (theme === "system") {
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  })();

  const canHideEditor = showPreview;
  const canHidePreview = showEditor;

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b-2 bg-background px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tracking-tight text-lg">Markdown Editor</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="hidden sm:flex border-2 font-mono text-xs uppercase font-bold"
          >
            <Printer className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrint}
            className="flex sm:hidden"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            title={`Theme: ${theme}`}
            className="ml-1"
          >
            {getThemeIcon()}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 sm:p-6 bg-muted/10">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="h-full w-full border-2 bg-background shadow-none"
        >
          {/* Editor Panel */}
          {showEditor && (
            <>
              <ResizablePanel defaultSize={showPreview ? 50 : 100} minSize={20} className="flex flex-col">
                <div className="flex shrink-0 items-center justify-between border-b-2 px-4 h-14 bg-muted/20">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">Editor</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 px-2 text-xs font-mono"
                      onClick={insertPageBreak}
                      title="Insert Page Break"
                    >
                      <Scissors className="h-4 w-4" />
                      <span className="hidden sm:inline">Page Break</span>
                    </Button>
                    {!showPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 px-2 text-xs font-mono"
                        onClick={() => setShowPreview(true)}
                        title="Show Preview"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Show Preview</span>
                      </Button>
                    )}
                    {canHideEditor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowEditor(false)}
                        title="Hide Editor"
                      >
                        <PanelLeftClose className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="flex-1 w-full resize-none bg-background p-6 font-mono text-sm leading-7 outline-none focus:ring-0 border-none"
                  placeholder="Start writing..."
                  spellCheck={false}
                />
              </ResizablePanel>
              
              {showPreview && <ResizableHandle withHandle className="bg-border w-1" />}
            </>
          )}
          
          {/* Preview Panel */}
          {showPreview && (
            <ResizablePanel defaultSize={showEditor ? 50 : 100} minSize={30} className="flex flex-col">
              <div className="flex shrink-0 items-center justify-between border-b-2 px-4 h-14 bg-muted/20">
                <span className="font-mono text-xs uppercase tracking-[0.2em] font-bold">Preview</span>
                <div className="flex items-center gap-1">
                  {!showEditor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 px-2 text-xs font-mono"
                      onClick={() => setShowEditor(true)}
                      title="Show Editor"
                    >
                      <PanelLeftOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Show Editor</span>
                    </Button>
                  )}
                  {canHidePreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowPreview(false)}
                      title="Hide Preview"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="h-full bg-background/50">
                <div className="p-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6" id="markdown-preview">
                  <MarkdownPreview 
                    source={markdown} 
                    rehypePlugins={[rehypeRaw]}
                    style={{
                      backgroundColor: 'transparent', 
                      color: 'inherit',
                      fontFamily: 'inherit'
                    }}
                    wrapperElement={{
                      "data-color-mode": effectiveTheme === 'dark' ? 'dark' : 'light'
                    } as any}
                  />
                </div>
              </ScrollArea>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
