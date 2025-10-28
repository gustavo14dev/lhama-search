'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  htmlContent: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ htmlContent }) => {
  const parts = htmlContent.split(/(<span class="math-expression">.*?<\/span>)/g);

  return (
    <div>
      {parts.map((part, index) => {
        const match = part.match(/<span class="math-expression">(.*?)<\/span>/);
        if (match) {
          const mathExpression = match[1];
          // Use BlockMath for multiline or complex expressions, InlineMath for others.
          // This is a simple heuristic, can be improved.
          if (mathExpression.includes('\\')) {
            return <BlockMath key={index} math={mathExpression} />;
          }
          return <InlineMath key={index} math={mathExpression} />;
        }
        // Render regular HTML parts
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
};

export default MathRenderer;
