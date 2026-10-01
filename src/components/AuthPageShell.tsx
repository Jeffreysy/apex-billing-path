import type { ReactNode } from "react";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

const AuthPageShell = ({ title, description, children }: Props) => (
  <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_38%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.4))]">
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="select-none text-[clamp(4rem,15vw,12rem)] font-black uppercase tracking-[0.32em] text-primary/[0.08]">
        LexCollect
      </div>
    </div>

    <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md border-white/50 bg-card/95 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
      </Card>
    </div>
  </div>
);

export default AuthPageShell;
