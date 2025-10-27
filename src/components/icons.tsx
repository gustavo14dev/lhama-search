import type React from 'react';

export const LlamaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 17.5c0 2.48-2.02 4.5-4.5 4.5S5 19.98 5 17.5c0-2.48 2.02-4.5 4.5-4.5h0c-1.38 0-2.5-1.12-2.5-2.5V6.5c0-1.38 1.12-2.5 2.5-2.5h0c2.48 0 4.5 2.02 4.5 4.5" />
    <path d="M14 13c0 2.48 2.02 4.5 4.5 4.5S23 15.48 23 13c0-2.48-2.02-4.5-4.5-4.5h-1" />
    <path d="M17.5 8.5c0-1.38-1.12-2.5-2.5-2.5" />
    <path d="M14 13h-1" />
  </svg>
);

export const SparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 0C10.84 6.06 6.06 10.84 0 12c6.06 1.16 10.84 5.94 12 12c1.16-6.06 5.94-10.84 12-12C17.94 10.84 13.16 6.06 12 0z" />
  </svg>
);
