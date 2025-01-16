import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTelegram } from '../hooks/useTelegram';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, isUser }) => {
  const { tg } = useTelegram();
  const isDarkTheme = tg.colorScheme === 'dark';

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`prose ${isDarkTheme ? 'prose-invert' : ''} max-w-none`}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (!inline && language) {
            return (
              <div className="relative group">
                <div className="absolute -top-3 right-2 bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {language}
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={isDarkTheme ? tomorrow : oneLight}
                  PreTag="div"
                  customStyle={{
                    margin: '1em 0',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code
              className={`${className} px-1.5 py-0.5 rounded font-mono text-sm bg-gray-100 dark:bg-gray-800`}
              {...props}
            >
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 hover:underline transition-colors duration-200"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};