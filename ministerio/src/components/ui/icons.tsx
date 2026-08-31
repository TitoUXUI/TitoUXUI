import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function base(children: React.ReactNode) {
  return function Icon({ className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className ?? "h-5 w-5"}
        {...props}
      >
        {children}
      </svg>
    );
  };
}

export const HomeIcon = base(
  <>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
  </>,
);

export const CalendarIcon = base(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </>,
);

export const TasksIcon = base(
  <>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="m8.5 12 2.2 2.2L16 9.7" />
  </>,
);

export const WallIcon = base(
  <>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4A8.5 8.5 0 1 1 21 11.5Z" />
    <path d="M8 10h8M8 14h5" />
  </>,
);

export const MoreIcon = base(
  <>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" />
  </>,
);

export const UsersIcon = base(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6.2M21.5 20a6 6 0 0 0-5-5.9" />
  </>,
);

export const BookIcon = base(
  <>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5Z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
  </>,
);

export const ReportIcon = base(
  <>
    <path d="M6 3h9l5 5v13H6Z" />
    <path d="M15 3v5h5M9 12h6M9 16h6" />
  </>,
);

export const LogOutIcon = base(
  <>
    <path d="M15 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h9" />
    <path d="M10 12h11M17 8l4 4-4 4" />
  </>,
);

export const BellIcon = base(
  <>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </>,
);

export const PlusIcon = base(<path d="M12 5v14M5 12h14" />);

export const ChevronLeftIcon = base(<path d="m14.5 5-7 7 7 7" />);

export const XIcon = base(<path d="m5 5 14 14M19 5 5 19" />);

export const CheckIcon = base(<path d="m4 12 5.5 5.5L20 7" />);

export const ClockIcon = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>,
);

export const MapPinIcon = base(
  <>
    <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </>,
);

export const ShieldIcon = base(<path d="M12 3 4 6v6c0 4.6 3.4 8.3 8 9 4.6-.7 8-4.4 8-9V6Z" />);

export const AlertIcon = base(
  <>
    <path d="M12 3 2 20h20Z" />
    <path d="M12 9.5v4.5M12 17h.01" />
  </>,
);

export const AppleIcon = base(
  <path d="M16.4 12.1c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.9-1.5 0-2.9.9-3.7 2.3-1.6 2.8-.4 6.9 1.1 9.1.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.5ZM14 4.9c.6-.8 1.1-1.8 1-2.9-.9.1-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.6-1.3Z" />,
);
