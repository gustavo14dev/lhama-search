'use client';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface MathRendererProps {
  htmlContent: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ htmlContent }) => {
  // Regex to find all math expressions, including inline and block
  const mathExpressionRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\))/g;
  const parts = htmlContent.split(mathExpressionRegex);

  return (
    <div>
      {parts.map((part, index) => {
        if (!part) return null;

        const isMath = mathExpressionRegex.test(part);

        if (isMath) {
          // Determine if it's a block or inline expression
          const isBlock = part.startsWith('$$') || part.startsWith('\\[');
          
          // Clean the expression from its delimiters
          let math = part.replace(/^\$\$|^\\[|\\\]$|^\$\$/g, '');
          math = math.replace(/^\\\(|\\\)$/g, '');

          if (isBlock) {
            return <BlockMath key={index} math={math} />;
          }
          return <InlineMath key={index} math={math} />;
        }
        
        // Render regular HTML parts safely
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
};

export default MathRenderer;
