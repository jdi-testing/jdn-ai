import React, { useEffect, useRef, useState } from "react";
import Children from 'react-children-utilities';
import { useRemark } from "react-remark";
import { CopyButton } from "./CopyButton";

export const useGuideRehype = () => useRemark({
  rehypeReactOptions: {
    components: {
      a: (props: Record<string, unknown>) => <a target="_blank" rel="noreferrer" {...props} />,
      pre: (props: Record<string, unknown>) => {
        const preElement = useRef(null);
        const [text, setText] = useState("");

        useEffect(() => {
          /* eslint-disable-next-line */
            // @ts-ignore
          setText(Children.onlyText(props.children));
        }, []);

        return <div className="jdn__guide_code">
          <pre ref={preElement} {...props} />
          <CopyButton copyText={text} buttonClassName="jdn__guide_copy" />
        </div>;
      },
    },
  },
});
