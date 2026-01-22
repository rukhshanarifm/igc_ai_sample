import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  Mail, 
  Calendar, 
  Printer, 
  Share2,
  BarChart3,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";

export function QuickActions() {
  const handleExportPDF = () => {
    toast.success("Generating PDF report...", {
      description: "Your report will be ready shortly.",
    });
  };

  const handleExportCSV = () => {
    toast.success("Exporting data to CSV...", {
      description: "Download will start automatically.",
    });
  };

  const handleScheduleReport = () => {
    toast.info("Schedule Report", {
      description: "This feature will be available soon.",
    });
  };

  const handleEmailBrief = () => {
    toast.info("Email Daily Brief", {
      description: "Configure email recipients in settings.",
    });
  };

  const actions = [
    {
      icon: FileText,
      label: "Export PDF",
      description: "Download full report",
      onClick: handleExportPDF,
      color: "primary",
    },
    {
      icon: FileSpreadsheet,
      label: "Export CSV",
      description: "Raw data export",
      onClick: handleExportCSV,
      color: "accent",
    },
    {
      icon: Calendar,
      label: "Schedule Report",
      description: "Automated delivery",
      onClick: handleScheduleReport,
      color: "chart-3",
    },
    {
      icon: Mail,
      label: "Email Brief",
      description: "Send to stakeholders",
      onClick: handleEmailBrief,
      color: "warning",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      primary: { bg: "bg-primary/10", text: "text-primary", hover: "hover:bg-primary/20" },
      accent: { bg: "bg-accent/10", text: "text-accent", hover: "hover:bg-accent/20" },
      "chart-3": { bg: "bg-chart-3/10", text: "text-chart-3", hover: "hover:bg-chart-3/20" },
      warning: { bg: "bg-warning/10", text: "text-warning", hover: "hover:bg-warning/20" },
    };
    return colors[color] || colors.primary;
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const colors = getColorClasses(action.color);
            const Icon = action.icon;
            
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`p-4 rounded-lg ${colors.bg} ${colors.hover} border border-transparent hover:border-border/50 transition-all text-left group`}
              >
                <div className={`p-2 rounded-lg ${colors.bg} w-fit mb-3`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
