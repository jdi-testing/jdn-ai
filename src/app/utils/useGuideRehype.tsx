import React, { useEffect, useRef, useState } from 'react';
import { Collapse } from 'antd';
import Children from 'react-children-utilities';
import { useRemark } from 'react-remark';
import rehypeRaw from 'rehype-raw';
import remarkEmoji from 'remark-emoji';
import rehypeSanitize from 'rehype-sanitize';
import { CopyButton } from '../../common/components/CopyButton';

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
          const header = Children.onlyText(Children.filter(props.children, (child) => child.type === 'summary'));
          return (
            <div className="jdn__guide_collapse">
              <Collapse ghost>
                <Collapse.Panel key="0" {...{ header }}>
                  {props.children}
                </Collapse.Panel>
              </Collapse>
            </div>
          );
        },
      },
    },
  });
