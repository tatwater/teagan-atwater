import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { CardBase } from '@/islands/resume/card-base';


export function ProjectCard(props: {
  item: ResumeItem;
  activeTag?: SkillTag | null;
  searchTerms?: string[];
  verbosity: Verbosity;
}) {
  return (
    <CardBase
      activeTag={props.activeTag}
      item={props.item}
      logoShape={props.item.logoShape ?? 'squircle'}
      searchTerms={props.searchTerms}
      showDuration={true}
      showOrgInHeader={false}
      showLogoInTitle={true}
      showTagFooter={true}
      verbosity={props.verbosity}
    />
  );
}
