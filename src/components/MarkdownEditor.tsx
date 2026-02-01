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

const defaultMarkdown = `# Modern Markdown Editor

A powerful, minimalist, and real-time markdown editing experience.

---

## Getting Started

This editor provides a split-view experience where you can write in **Markdown** on the left and see the rendered **Preview** on the right.

### Core Features:
- **Real-time Preview**: See changes as you type.
- **Syntax Highlighting**: Beautiful code blocks for many languages.
- **PDF Export**: Generate high-quality documents with one click.
- **Dark Mode Support**: Easy on the eyes, day or night.

---

## Styling Guide

### Typography
You can style your text using standard Markdown syntax:
- **Bold text** using \`**text**\` or \`__text__\`
- *Italic text* using \`*text*\` or \`_text_\`
- ~~Strikethrough~~ using \`~~text~~\`
- \`Inline code\` using backticks

### Blockquotes
> "Markdown is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML)."
> — *John Gruber*

---

## Code Snippets

The editor supports syntax highlighting for various programming languages.

\`\`\`javascript
// A simple function to greet the user
function greet(name) {
  console.log(\`Hello, \${name}! Welcome to the editor.\`);
}

greet('Developer');
\`\`\`

---

## Data & Organization

### Tables
| Feature | Status | Priority |
| :--- | :---: | :--- |
| Editor | Done | High |
| PDF Print | Done | Medium |
| Cloud Sync | Planned | Low |

### Tasks & Lists
- [x] Write documentation
- [x] Test responsiveness
- [ ] Implement auto-save
- [ ] Add plugin support

---

## Media & Links
Insert images and links easily:

![Header Image](https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80)

[GitHub Repository](https://github.com/anuzsubedi/markdown-editor) | [Markdown Guide](https://www.markdownguide.org)

---

## Page Management

To force a page break during PDF export, use the **Page Break** button in the toolbar or insert the following HTML tag:

\`<div class="page-break"></div>\`

<div class="page-break"></div>

# Second Page Content

This content is automatically moved to a new page when printing or saving as PDF. This is ideal for:
1. **Title Pages**
2. **Table of Contents**
3. **New Chapters**
`;

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [pdfMargin, setPdfMargin] = useState("20mm");
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [dontShowPrintDialog, setDontShowPrintDialog] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dontShowPrintDialog') === 'true';
    }
    return false;
  });
  const [dialogCheckbox, setDialogCheckbox] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const executePrint = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    setTimeout(() => {
      const printContent = document.getElementById("markdown-preview");
      if (printContent) {
        const originalContents = document.body.innerHTML;
        const originalTitle = document.title;
        const printClone = printContent.cloneNode(true) as HTMLElement;
        
        const markdownElement = printClone.querySelector('[data-color-mode]');
        if (markdownElement) {
          markdownElement.setAttribute('data-color-mode', 'light');
        }
        
        // Inject page margin styles
        const style = document.createElement('style');
        style.innerHTML = `
          @page {
            margin: ${pdfMargin};
          }
          @media print {
            body {
              margin: 0;
            }
          }
        `;
        printClone.appendChild(style);
        
        document.body.innerHTML = "";
        document.body.appendChild(printClone);
        document.title = "\u00A0";
        
        window.print();
        
        document.title = originalTitle;
        document.body.innerHTML = originalContents;
        
        if (isDark) {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
        }
        window.location.reload(); 
      }
    }, 100);
  };

  const handlePrint = () => {
    if (dontShowPrintDialog) {
      executePrint();
    } else {
      setShowPrintDialog(true);
    }
  };

  const confirmPrint = () => {
    if (dialogCheckbox) {
      localStorage.setItem('dontShowPrintDialog', 'true');
      setDontShowPrintDialog(true);
    }
    setShowPrintDialog(false);
    executePrint();
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
      {/* Print Dialog */}
      {showPrintDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold leading-none tracking-tight mb-4">Print Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For the best result, please disable <strong>"Headers and footers"</strong> in your browser's print settings dialog.
            </p>
            <div className="flex items-center space-x-2 mb-6">
              <input 
                type="checkbox" 
                id="dont-show" 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={dialogCheckbox}
                onChange={(e) => setDialogCheckbox(e.target.checked)}
              />
              <label 
                htmlFor="dont-show" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Don't show this again
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmPrint}>
                Print
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b-2 bg-background px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tracking-tight text-lg">Markdown Editor</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={pdfMargin}
            onChange={(e) => setPdfMargin(e.target.value)}
            title="PDF Margin"
          >
            <option value="0mm">No Margin</option>
            <option value="10mm">Narrow (10mm)</option>
            <option value="20mm">Standard (20mm)</option>
            <option value="25.4mm">Wide (1in)</option>
          </select>
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
                <div className="p-8 pb-20 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6" id="markdown-preview">
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
