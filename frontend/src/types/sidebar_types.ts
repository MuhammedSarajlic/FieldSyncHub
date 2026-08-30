import type { ComponentType } from 'react';

export type sidebarItem = {
  name: string;
  slug: string;
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
};
