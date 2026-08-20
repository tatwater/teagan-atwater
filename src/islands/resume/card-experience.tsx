import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem } from '@/data/resume/types';

import { CardBase } from '@/islands/resume/card-base';


export function ExperienceCard(props: {
  item: ResumeItem;
  searchTerms?: string[];
  verbosity: Verbosity;
}) {
  return (
    <CardBase
      item={props.item}
      logoShape={props.item.logoShape ?? 'squircle'}
      searchTerms={props.searchTerms}
      showDuration={true}
      showOrgInHeader={true}
      showTagFooter={true}
      verbosity={props.verbosity}
    />
  );
}
