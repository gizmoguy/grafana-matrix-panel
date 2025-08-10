import { DisplayValue, LinkModel } from '@grafana/data';

export interface MatrixOptions {
  sourceField: string;
  targetField: string;
  values: number;
  valueField1: string;
  valueField2: string;
  cellSize: number;
  cellPadding: number;
  txtLength: number;
  txtSize: number;
  nullColor: string;
  defaultColor: string;
  sourceText: string;
  targetText: string;
  valueText1: string;
  valueText2: string;
  addUrl: boolean;
  url: string;
  urlVar1: string;
  urlVar2: string;
  urlOther: boolean;
  urlOtherText: string;
  inputList: boolean;
  staticRows: string[];
  staticColumns: string[];
  showLegend: boolean;
  legendType: string;
  thresholds: any[];
}

export type MatrixData = {
  rows: string[];
  columns: string[];
  series: string[];
  data: DataMatrixCell[][];
  legend: LegendData[];
};

export type MatrixDataError = {
  error: string;
};

export type DataMatrixCell = {
  row: string;
  col: string;
  vals: Array<{
    value: number;
    color: string;
    display: DisplayValue;
    url: LinkModel | undefined;
  }>;
};

export type LegendData = {
  label: string;
  color: string;
};
