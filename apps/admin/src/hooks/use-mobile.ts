import useMediaQuery from "@/hooks/use-media-query.ts";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`) || false;
}
