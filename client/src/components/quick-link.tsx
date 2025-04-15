import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickLinkProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

export default function QuickLink({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = "text-primary",
  onClick
}: QuickLinkProps) {
  return (
    <Card 
      className="border border-border hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`h-10 w-10 ${iconColor} mb-4 flex items-center justify-center`}>
            <Icon className="h-10 w-10" />
          </div>
          <h3 className="font-medium text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
