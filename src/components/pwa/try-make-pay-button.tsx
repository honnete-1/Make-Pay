"use client";

import { ArrowUpRight, Download } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useInstallDialog } from "./install-context";
import { cn } from "@/lib/utils";

/** Marketing CTA — opens the PWA download dialog instead of navigating into /app. */
export function TryMakePayButton({
  children = <>Try Mâke pay <ArrowUpRight /></>,
  className,
  variant = "primary",
  size = "sm",
  block,
  ...props
}: Omit<ButtonProps, "onClick" | "asChild"> & { children?: React.ReactNode }) {
  const { openInstall } = useInstallDialog();
  return (
    <Button type="button" variant={variant} size={size} block={block} className={className} onClick={openInstall} {...props}>
      {children}
    </Button>
  );
}

export function TryMakePayLink({
  className,
  children = <>See how Mâke pay works <ArrowUpRight className="size-4" /></>,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { openInstall } = useInstallDialog();
  return (
    <button type="button" onClick={openInstall} className={cn(className)}>
      {children}
    </button>
  );
}

export function DownloadMakePayButton(props: Omit<ButtonProps, "onClick" | "asChild" | "children">) {
  return (
    <TryMakePayButton {...props}>
      <Download /> Download Mâke pay
    </TryMakePayButton>
  );
}
