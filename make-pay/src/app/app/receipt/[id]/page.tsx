import { Suspense } from "react";
import { ReceiptView } from "@/components/payment/receipt-view";
import { LoadingScreen } from "@/components/app/app-chrome";

export const metadata = { title: "Receipt" };

export default function ReceiptPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ReceiptView />
    </Suspense>
  );
}
