import React, { ReactNode } from 'react';
import parse, { Element } from 'html-react-parser';
import { Stack } from '@mui/material';

const DocumentRenderer = ({
  htmlString,
  replacements,
}: {
  htmlString: string;
  replacements: {
    text: string;
    component: React.FC<{ key: string; children: ReactNode }> | string;
  }[];
}) => {
  const parsedHtml = parse(htmlString, {
    replace: (node) => {
      if (node.type === 'text') {
        let replacedText = node.data;
        replacements.forEach(({ text, component: Component }) => {
          const regex = new RegExp(
            `\\{\\{\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`,
            'g'
          );
          if (regex.test(node.data)) {
            const parts = node.data.split(regex);
            // @ts-ignore
            replacedText = (
              <>
                {parts.map((part, index) => {
                  if (index < parts.length - 1) {
                    return (
                      <React.Fragment key={node.data + index}>
                        {part}
                        {index < parts.length - 1 && (
                          <Component key={node.data + index}>{text}</Component>
                        )}
                      </React.Fragment>
                    );
                  }
                  return part;
                })}
              </>
            );
          }
        });

        if (typeof replacedText === 'string') {
          replacedText = replacedText.replace(/\{\{\s*.*?\s*\}\}/g, ' '.repeat(10));
          node.data = replacedText;
        }

        return replacedText;
      }

      if (node instanceof Element && node.attribs && node.attribs.id === 'page-break') {
        return (
          <Stack
            sx={{
              my: 10,
            }}
          >
            <Stack
              sx={{
                width: '100%',
                height: 30,
                position: 'absolute',
                left: 0,
                right: 0,
                background: (theme) => theme.palette.background.neutral,
              }}
            />
          </Stack>
        );
      }

      return node;
    },
  });

  return <div>{parsedHtml}</div>;
};

export default DocumentRenderer;
