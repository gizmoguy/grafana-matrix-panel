import { DataMatrixCell, LegendData } from './types';

export function matrix(
  rowNames: string[],
  colNames: string[],
  series: string[],
  matrix: DataMatrixCell[][],
  id: number,
  height: number,
  options: MatrixOptions,
  legend: LegendData[],
): LegacyRef<SVGSVGElement> | undefined;
