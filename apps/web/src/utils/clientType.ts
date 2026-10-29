import type { ClientType } from "@verify/contracts";

export function detectClientType(): ClientType {
  const nav = navigator as Navigator & {
    userAgentData?: { mobile: boolean };
  };

  const isMobile = nav.userAgentData?.mobile ?? /Mobi/i.test(nav.userAgent);

  return isMobile ? "mobile" : "desktop";
}
