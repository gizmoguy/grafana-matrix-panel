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
  const parsedData = React.useMemo(() => {
    return parseData(data, options, theme);
  }, [data, options, theme]);

  const ref = Matrix.matrix(
    id,
    options,
    parsedData,
  );
  const matrixClass = `matrix-panel-${id}`;

  return (
    <ScrollContainer minHeight="100%">
      <div ref={ref} id={matrixClass}></div>
    </ScrollContainer>
  );
};
