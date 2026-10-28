"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { WifiOff } from "lucide-react";
import { AppHeader, EmptyState, PageColumn } from "@/components/app/app-chrome";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <>
      <AppHeader back="/app" title="Offline" right={<span />} />
      <PageColumn>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <EmptyState
            icon={<WifiOff />}
            title="This page isn’t saved"
            body="Open it once while online and it will be available offline on this device."
            action={
              <Button asChild size="xl">
                <Link href="/app">Back to home</Link>
              </Button>
            }
          />
        </motion.div>
      </PageColumn>
    </>
  );
}
