'use client';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface MathRendererProps {
  htmlContent: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ htmlContent }) => {
  // Regex to find all math expressions (inline and block) and also capture regular text.
  const combinedRegex = /(\$\$[\s\S]*?\$\$|\\\[[\sS]*?\\\]|\\\(.*?\\\)|[\s\S]+?(?=\$\$|\\\[|\\\(|$))/g;
  const parts = htmlContent.match(combinedRegex) || [];

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0 prose-ul:my-2 prose-li:my-1 prose-hr:my-4 prose-headings:my-4 prose-blockquote:my-2 prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:font-mono prose-code:text-sm prose-table:my-4 prose-table:w-full prose-th:border prose-th:p-2 prose-td:border prose-td:p-2 prose-pre:whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (!part) return null;

        const isBlock = part.startsWith('$$') || part.startsWith('\\[');
        const isInline = part.startsWith('\\(');

        if (isBlock) {
          const math = part.replace(/^\$\$|^\\[|^\\]$|^\$\$/g, '').trim();
          try {
            return <div key={index} className="my-4"><BlockMath math={math} /></div>;
          } catch (error) {
            return <code key={index}>{part}</code>;
          }
        }
        
        if (isInline) {
          const math = part.replace(/^\\\(|\\\)$/g, '').trim();
          try {
            return <InlineMath key={index} math={math} />;
          } catch (error) {
            return <code key={index}>{part}</code>;
          }
        }
        
        // Render regular HTML parts safely
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
};

export default MathRenderer;
