import type { ReactNode } from 'react';
export function FigMark({size=34}:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="11" fill="#2667EF"/><path d="M10 29V12H29" stroke="white" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 25L20 20L24 23L30 14" stroke="white" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round"/><circle cx="30" cy="14" r="2" fill="#99EBFF"/></svg>;
}
export function LabelIcon({children}:{children:ReactNode}) {return <span className="icon-label">{children}</span>}
