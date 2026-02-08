export const GADS_ID = "AW-11090068921";
export const CONVERSION_ID = "AW-11090068921/sa9ZCOeiz_QbELmLlKgp";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    gtag_report_conversion?: (url?: string) => boolean;
  }
}
