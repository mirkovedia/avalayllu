import { type LucideIcon } from "lucide-react";
import { Button } from "./Button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-white/20" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-white/40 max-w-xs mb-6">{description}</p>
    {actionLabel && (actionHref ? (
      <Link href={actionHref}>
        <Button>{actionLabel}</Button>
      </Link>
    ) : onAction ? (
      <Button onClick={onAction}>{actionLabel}</Button>
    ) : null)}
  </div>
);
