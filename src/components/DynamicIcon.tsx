import {
    User,
    Users,
    Brain,
    Heart,
    Clock,
    ArrowRight,
    Compass,
    Monitor,
    type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
    User,
    Users,
    Brain,
    Heart,
    Clock,
    ArrowRight,
    Compass,
    Monitor,
};

interface DynamicIconProps {
    name: string;
    className?: string;
}

export const DynamicIcon = ({ name, className }: DynamicIconProps) => {
    const IconComponent = icons[name] || ArrowRight;
    return <IconComponent className={className} />;
};
