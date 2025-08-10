import { DataMatrixCell } from './types';

export function matrix(
  rowNames: any, 
  colNames: any, 
  series: string[],
  matrix: DataMatrixCell[][],
  id: number,
  height: number,
  options: any,
  legend: any
): LegacyRef<SVGSVGElement> | undefined;
