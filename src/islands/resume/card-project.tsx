import type { Verbosity } from '@/islands/resume/types';
import type { ResumeItem, SkillTag } from '@/data/resume/types';

import { CardBase } from '@/islands/resume/card-base';


export function ProjectCard(props: {
  activeTags: Set<SkillTag>;
  item: ResumeItem;
  onTagClick: (tag: SkillTag) => void;
  verbosity: Verbosity;
}) {
  return (
    <CardBase
      activeTags={props.activeTags}
      item={props.item}
      logoShape={props.item.logoShape ?? 'squircle'}
      onTagClick={props.onTagClick}
      showDuration={true}
      showOrgInHeader={false}
      showLogoInTitle={true}
      showTagFooter={true}
      verbosity={props.verbosity}
    />
  );
}
