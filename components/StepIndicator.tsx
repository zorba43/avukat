import { Fragment } from "react";

/**
 * Kaza Bildir akışı adım göstergesi. Gerçek bir sıra olduğu için numaralı.
 * Aktif/tamamlanan adım --navy, pasif adımlar --line ile gösterilir.
 */
const STEPS = [
  { n: 1, label: "Kişisel Bilgiler" },
  { n: 2, label: "Ruhsat & Ehliyet" },
  { n: 3, label: "Kaza Raporu" },
  { n: 4, label: "Olay Yeri" },
  { n: 5, label: "Tamamla" },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-start" aria-label="Başvuru adımları">
      {STEPS.map((step, i) => {
        const active = step.n <= current;
        return (
          <Fragment key={step.n}>
            <li
              className="flex min-w-0 flex-1 basis-0 flex-col items-center gap-2"
              aria-current={step.n === current ? "step" : undefined}
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
                  active
                    ? "bg-navy text-white"
                    : "border border-line bg-paper text-slate",
                ].join(" ")}
              >
                {step.n}
              </span>
              <span
                className={[
                  "max-w-full break-words text-center text-[12px] leading-tight sm:text-[13px]",
                  active ? "font-medium text-navy" : "text-slate",
                ].join(" ")}
              >
                {step.label}
              </span>
            </li>

            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={[
                  "mt-[15px] h-0.5 w-3 shrink-0 rounded sm:w-6",
                  step.n < current ? "bg-navy" : "bg-line",
                ].join(" ")}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
