import { Field, FieldType, getFieldDisplayName, GrafanaTheme2, PanelData } from '@grafana/data';
import { DataMatrixCell, LegendData, MatrixData, MatrixDataError, MatrixOptions } from './types';

// import { legend } from 'matrixLegend';

/**
 * this function creates an adjacency matrix to be consumed by the matrix diagram
 * function returns the matrix + forward and reverse lookup Maps to go from
 * source and target id to description assumes that data coming to us has at
 * least 3 columns if no preferences provided, assumes the first 3 columns are
 * source and target dimensions then value to display
 * @param {PanelData} data Data for the matrix diagram
 * @param {MatrixOptions} options Panel configuration
 * @param {GrafanaTheme2} theme Grafana theme
 * @return {MatrixData | MatrixDataError}
 */

export function parseData(
  data: PanelData,
  options: MatrixOptions,
  theme: GrafanaTheme2,
): MatrixData | MatrixDataError {
  const series = data.series[0];
  if (series === null || series === undefined) {
    // no data, bail
    return { error: 'no data' };
  }

  // set fields
  const sourceField = series.fields.find((f: Field) =>
    options.sourceField === f.name
    || options.sourceField === f.config?.displayNameFromDS
    || options.sourceField === getFieldDisplayName(f)
  ) ?? series.fields[0];
  const targetField = series.fields.find((f: Field) =>
    options.targetField === f.name
    || options.targetField === f.config?.displayNameFromDS
    || options.targetField === getFieldDisplayName(f)
  ) ?? series.fields[1];
  const valueFields: Field[] = [];

  for (let i = 0; i < options.values; i++) {
    let field = undefined;

    const valueField = (i === 0) ? options.valueField1 : options.valueField2;
    if (valueField !== undefined) {
      field = series.fields.find((f: Field) =>
        valueField === f.name
        || valueField === f.config?.displayNameFromDS
        || valueField === getFieldDisplayName(f)
      );
    }

    if (field === undefined && i === 0) {
      field = series.fields.find((f: Field) => f.type === FieldType.number);
    }

    if (field !== undefined) {
      valueFields.push(field);
    }
  }

  const seriesNames: string[] = [
    getFieldDisplayName(sourceField),
    getFieldDisplayName(targetField),
  ];
  valueFields.forEach((f) => seriesNames.push(getFieldDisplayName(f)));

  // function that maps value to color specified by Standard Options panel.
  // if value is null or was not returned by query, use different value
  const nullColor = theme.visualization.getColorByName(options.nullColor);
  const defaultColor = theme.visualization.getColorByName(options.defaultColor);
  function colorMap(v: any): string {
    if (v == null) {
      return nullColor;
    }
    if (valueFields[0].display) {
      return valueFields[0].display(v).color ?? defaultColor;
    }
    return defaultColor;
  }

  // Make Row and Column Lists
  let rowNames: string[] = [];
  let colNames: string[] = [];

  // IF static list toggle is set, use input list
  if (options.inputList) {
    if (options.staticRows !== undefined) {
      rowNames = options.staticRows.split(',');
    }
    if (options.staticColumns !== undefined) {
      colNames = options.staticColumns.split(',');
    }
  } else {
    // ELSE  Make new arrays from unique set of row and column axis labels
    rowNames = Array.from(new Set(sourceField.values));
    colNames = Array.from(new Set(targetField.values));
  }

  if (rowNames.length === 0 || colNames.length === 0) {
    // no data, bail
    return { error: 'no data' };
  }

  // sort row/col names with natural sort
  rowNames.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  colNames.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const numSquaresInMatrix = rowNames.length * colNames.length;
  if (numSquaresInMatrix > 50000) {
    return { error: 'too many inputs' };
  }

  //playground DELETE LATER ////////////////
  // let tempvals = frame.fields[valKey];
  // let min = 0;
  // let max = 0;
  // if (tempvals.state) {
  //   if(tempvals.state.range) {
  //     if(tempvals.state.range.min) {
  //     min = tempvals.state.range.min;
  //     }
  //     if (tempvals.state.range.max) {
  //       max = tempvals.state.range.max;
  //     }
  //   }
  // }
  // console.log(`min: ${min} max: ${max}`);

  ////////////////////////////

  // console.log(options);
  // create data matrix
  const dataMatrix: DataMatrixCell[][] = [];

  for (let i = 0; i < rowNames.length; i++) {
    dataMatrix[i] = [];
    for (let j = 0; j < colNames.length; j++) {
      dataMatrix[i][j] = {
        row: rowNames[i],
        col: colNames[j],
        vals: [],
      };
    }
  }

  valueFields.forEach((f, i) => {
    f.values.forEach((v, j) => {
      const r = rowNames.indexOf(sourceField.values[j]);
      const c = colNames.indexOf(targetField.values[j]);
      if (r > -1 && c > -1) {
        let url = undefined;
        if ((f.config.links?.length ?? 0) > 0 && f.getLinks) {
          const links = f.getLinks({ valueRowIndex: j });
          if (links.length >= 1) {
            url = links[0];
          }
        }
        if (dataMatrix[r][c].vals[i] === undefined || v !== undefined) {
          dataMatrix[r][c].vals[i] = {
            value: v,
            color: colorMap(v),
            display: f.display ? f.display(v) : { numeric: 0, text: '' },
            url: url,
          };
        }
      }
    });
  });

  // parse data for legend
  const legendData: LegendData[] = [];
  if (options.showLegend) {
    let legendValues: any[] = [];
    if (options.legendType === 'range') { 
      //get min & max, steps
      let min = undefined;
      let max = undefined;
      for (const f of valueFields) {
        const fieldMin = Math.min(...f.values.filter(x => typeof x === 'number'));
        const fieldMax = Math.max(...f.values.filter(x => typeof x === 'number'));
        if (min === undefined || fieldMin < min) {
          min = fieldMin;
        }
        if (max === undefined || fieldMax > max) {
          max = fieldMax;
        }
      }
      const step = ((max ?? 0) - (min ?? 0)) / 10;
      // push 10 steps to use for legend
      for (let i = 0; i <= 10; i++) {
        legendValues.push((min ?? 0) + (i * step));
      }
    } else {
      // get unique categories
      const allValues = new Set<string>();
      for (const f of valueFields) {
        f.values.forEach((v) => {
          if (v !== undefined) {
            allValues.add(v);
          }
        });
      }
      legendValues = [...Array.from(allValues)];
    }
    legendValues.forEach((val) => {
      // find display values, unit & color for each
      // store in array
      let text = '';
      if (valueFields[0].display) {
        text = valueFields[0].display(val).text;
        if (valueFields[0].display(val).suffix) {
          text = text + ` ${valueFields[0].display(val).suffix}`;
        }
      }
        legendData.push({
          label: text,
          color: colorMap(val),
        });
    });
  }
  // console.log(legendData);

  const dataObject = {
    rows: rowNames,
    columns: colNames,
    series: seriesNames,
    data: dataMatrix,
    legend: legendData,
  };
  return dataObject;
}
