import { MatrixData, MatrixDataError, MatrixOptions } from './types';

export function matrix(
  id: number,
  options: MatrixOptions,
  matrix: MatrixData | MatrixDataError,
): LegacyRef<SVGSVGElement> | undefined;
