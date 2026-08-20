import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem } from '@/data/resume/types';

import { CardBase } from '@/islands/resume/card-base';


export function EducationCard(props: {
  item: ResumeItem;
  verbosity: Verbosity;
}) {
  return (
    <CardBase
      item={props.item}
      logoShape={props.item.logoShape}
      showOrgInHeader={true}
      verbosity={props.verbosity}
    />
  );
}
