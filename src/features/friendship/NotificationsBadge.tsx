interface NotificationBadgeProps {
  count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-background">
      <span className="text-[10px] font-bold text-white leading-none">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
}