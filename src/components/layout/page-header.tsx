import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Props for {@link PageHeader}. */
interface PageHeaderProps {
  /** Page title displayed prominently next to the back button. */
  title: string;
  /** Short description shown below the title. */
  subtitle: string;
  /** Destination for the back button. Defaults to the dashboard. */
  backHref?: string;
}

/**
 * Shared sticky page header used by feature pages (Stadium, Tournament,
 * Tickets, etc.) that follow a "back to dashboard" + title + subtitle
 * pattern. Extracted to avoid duplicating this markup across pages.
 */
export function PageHeader({ title, subtitle, backHref = "/dashboard" }: PageHeaderProps) {
  return (
    <header role="banner" className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-6 py-3 max-w-7xl mx-auto">
        <Link href={backHref} aria-label="Back to Dashboard">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-lg">{title}</h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
