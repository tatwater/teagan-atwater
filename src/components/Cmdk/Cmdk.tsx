'use client';

import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarResults,
  KBarSearch,
  useMatches,
} from 'kbar';


function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={ results }
      onRender={({ item, active }) =>
      typeof item === 'string' ? (
        <div>{ item }</div>
      ) : (
        <div
          style={{
            background: active ? 'var(--slate-3)' : 'transparent',
            ...itemStyle,
          }}
        >
          { item.name }
        </div>
      )}
    />
  );
}


export default function Cmdk() {
  return (
    <KBarPortal>
      <KBarPositioner style={{zIndex: 1002}}>
        <KBarAnimator style={animatorStyle}>
          <KBarSearch style={searchStyle} />
          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

const animatorStyle = {
  background: 'var(--color-background)',
  border: '1px solid var(--slate-3)',
  boxShadow: '0 30px 60px rgba(0,0,0,.12)',
  maxWidth: '600px',
  width: '100%',
  color: 'var(--foreground)',
  borderRadius: '8px',
  overflow: 'hidden',
  zIndex: 1002,
};

const itemStyle = {
  display: 'flex',
    alignItems: 'center',
  height: '2.5rem',
  paddingInline: '1rem',
};

const searchStyle = {
  padding: '12px 16px',
  fontSize: '16px',
  width: '100%',
  boxSizing: 'border-box' as React.CSSProperties['boxSizing'],
  outline: 'none',
  border: 'none',
  background: 'var(--color-background)',
  color: 'var(--foreground)',
};
