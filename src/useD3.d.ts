import { GrafanaTheme2 } from "@grafana/data";
import { MatrixData, MatrixDataError, MatrixOptions } from "./types";

type SvgInHtml = LegacyRef<SVGSVGElement> & undefined;
export function useD3(
  renderChartFn: any,
  id: number,
  options: MatrixOptions,
  matrix: MatrixData | MatrixDataError,
  theme: GrafanaTheme,
  styles: CSSReturnValue,
): SvgInHtml;
