import React, { FC } from 'react';
import { Button } from 'antd';
// import { useOnboardingContext } from '../../onboarding/OnboardingProvider';
// import { OnboardingStep } from '../../onboarding/constants';
import { ButtonProps } from 'antd/lib';

// interface Props extends ButtonProps {
//   // onClickCb: any; // To Do поправить тип
// }
export const PageObjGenerationButton: FC<ButtonProps> = ({ children, ...rest }) => {
  // const generationButtonRef = useRef<HTMLElement | null>(null);
  // const { updateStepRefs } = useOnboardingContext();

  // console.log('PageObjGenerationButton');

  // useEffect(() => {
  //   if (generationButtonRef.current) {
  //     console.log('_______________________', generationButtonRef);

  //     updateStepRefs(OnboardingStep.Generate, generationButtonRef, refFn);
  //   }
  // }, []);

  return (
    <Button {...{ ...rest }} className="jdn__buttons jdn__generationButtons_generate" style={{ marginRight: '10px' }}>
      {children}
    </Button>
  );
};
