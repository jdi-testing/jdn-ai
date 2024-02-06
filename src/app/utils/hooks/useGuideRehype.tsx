/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { Collapse } from 'antd';
import Children from 'react-children-utilities';
import { useRemark } from 'react-remark';
import rehypeRaw from 'rehype-raw';
import remarkEmoji from 'remark-emoji';
import rehypeSanitize from 'rehype-sanitize';
import { CopyButton } from '../../../common/components/CopyButton';

export const useGuideRehype = () =>
  useRemark({
    // @ts-ignore
    remarkPlugins: [remarkEmoji],
    // @ts-ignore
    rehypePlugins: [rehypeRaw, rehypeSanitize],
    remarkToRehypeOptions: {
      allowDangerousHtml: true,
    },
    rehypeReactOptions: {
      components: {
        a: (props: Record<string, unknown>) => <a target="_blank" rel="noreferrer" {...props} />,
        pre: (props: Record<string, unknown>) => {
          const preElement = useRef(null);
          const [text, setText] = useState('');

          useEffect(() => {
            /* eslint-disable-next-line */
            // @ts-ignore
            setText(Children.onlyText(props.children));
          }, []);

          return (
            <div className="jdn__guide_code">
              <pre ref={preElement} {...props} />
              <CopyButton copyText={text} buttonClassName="jdn__guide_copy" />
            </div>
          );
        },
        // @ts-ignore
        details: (props) => {
          // @ts-ignore
          const headerText = Children.onlyText(Children.filter(props.children, (child) => child.type === 'summary'));
          const key = `details-${headerText}-${Math.random().toString(16).slice(2)}`;

          return (
            <div className="jdn__guide_collapse">
              <Collapse ghost>
                <Collapse.Panel key={key} {...{ header: headerText }}>
                  {props.children}
                </Collapse.Panel>
              </Collapse>
            </div>
          );
        },
      },
    },
  });
