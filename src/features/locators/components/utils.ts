import { AnnotationType } from '../../../common/types/common';

export const annotationTypeOptions: { value: AnnotationType; label: AnnotationType }[] = Object.values(
  AnnotationType,
).map((type) => {
  return {
    value: type,
    label: type,
  };
});
