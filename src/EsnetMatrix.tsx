import React from 'react';
import { FieldConfigSource, PanelProps } from '@grafana/data';
import { MatrixOptions } from 'types';
import { parseData } from 'dataParser';
import { useTheme2, ScrollContainer } from '@grafana/ui';

import * as Matrix from './matrix.js';

interface Props extends PanelProps<MatrixOptions> {
  fieldConfig: FieldConfigSource;
  options: MatrixOptions;
}

export const EsnetMatrix: React.FC<Props> = ({ options, data, width, height, id }) => {
  const theme = useTheme2();
  const parsedData = parseData(data, options, theme);

  if ('error' in parsedData) {
    console.error(parsedData.error);
    switch (parsedData.error) {
      case 'too many inputs': {
        return <div>Too many data points! Try adding limits to your query.</div>;
      }
      case 'no data': {
        return <div>No Data</div>;
      }
      default: {
        return <div>Unknown Error</div>;
      }
    }
  }

  const ref = Matrix.matrix(
    parsedData.rows,
    parsedData.columns,
    parsedData.series,
    parsedData.data,
    id,
    height,
    options,
    parsedData.legend,
  );
  const thisPanelClass = `matrix-panel-${id}`;

  return (
    <ScrollContainer minHeight="100%">
      <div ref={ref} id={thisPanelClass}></div>
    </ScrollContainer>
  );
};
