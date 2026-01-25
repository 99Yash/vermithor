'use client';

import { PanelLeftIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

type SidebarToggleProps = {
  collapsed: boolean;
  onToggle: () => void;
  label?: string;
};

export function DashboardSidebarToggle({
  collapsed,
  onToggle,
  label,
}: SidebarToggleProps) {
  const ariaLabel = label ?? (collapsed ? 'Expand sidebar' : 'Collapse sidebar');

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      className={cn(
        'rounded-full border border-border/60 bg-background shadow-xs',
        'hover:bg-muted/60',
        collapsed && 'rotate-180',
      )}
      aria-pressed={collapsed}
      aria-label={ariaLabel}
    >
      <PanelLeftIcon className="size-4" />
    </Button>
  );
}
