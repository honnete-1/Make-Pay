"use client";

import * as React from "react";
import { Accordion as A } from "radix-ui";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = A.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof A.Item>) {
  return <A.Item className={cn("border-b border-forest/12", className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof A.Trigger>) {
  return (
    <A.Header className="flex">
      <A.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between gap-6 py-6 text-left font-display text-xl text-forest transition-colors hover:text-forest-600 md:text-2xl",
          className,
        )}
        {...props}
      >
        {children}
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-forest/15 transition-[transform,background-color] duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-lime">
          <Plus aria-hidden className="size-4" />
        </span>
      </A.Trigger>
    </A.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof A.Content>) {
  return (
    <A.Content
      className="overflow-hidden data-[state=closed]:animate-[acc-up_220ms_ease-out] data-[state=open]:animate-[acc-down_260ms_ease-out]"
      {...props}
    >
      <div className={cn("max-w-2xl pb-7 text-[17px] leading-relaxed text-ink-soft", className)}>{children}</div>
      <style>{`@keyframes acc-down{from{height:0}to{height:var(--radix-accordion-content-height)}}@keyframes acc-up{from{height:var(--radix-accordion-content-height)}to{height:0}}`}</style>
    </A.Content>
  );
}
