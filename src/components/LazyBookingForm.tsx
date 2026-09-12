import { lazy, Suspense } from "react";

const BookingForm = lazy(() =>
  import("@/components/BookingForm").then((module) => ({
    default: module.BookingForm,
  })),
);

export function LazyBookingForm({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground" role="status">
          Randevu formu yükleniyor...
        </div>
      )}
    >
      <BookingForm onSuccess={onSuccess} />
    </Suspense>
  );
}
