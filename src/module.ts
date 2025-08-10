import { Field, FieldType, PanelPlugin, FieldConfigProperty } from '@grafana/data';
// import { standardOptionsCompat } from 'grafana-plugin-support';
import { MatrixOptions } from './types';
import { EsnetMatrix } from './EsnetMatrix';
// import { FieldConfig } from './panelcfg.gen';

/**
 * Grafana panel plugin main module
 *
 * @param {*} { panel:
 *  React.ComponentType<PanelProps<NetSageSankeyOptions>> | null
 * }
 * @return {*} { builder: PanelOptionsEditorBuilder<NetSageSankeyOptions> }
 */
const OptionsCategory = ['Display'];
const RowOptions = ['Row/Column Options'];

const staticBool = (inputList: boolean) => (config: MatrixOptions) => config.inputList === inputList;
const legendBool = (showLegend: boolean) => (config: MatrixOptions) => config.showLegend === showLegend;

// const buildStandardOptions = (): any => {
//   const options = [FieldConfigProperty.Unit, FieldConfigProperty.Color, FieldConfigProperty.Thresholds];
//   return standardOptionsCompat(options);
// };

export const plugin = new PanelPlugin<MatrixOptions>(EsnetMatrix);

plugin.useFieldConfig({
  standardOptions: {
    [FieldConfigProperty.Thresholds]: {},
    [FieldConfigProperty.Color]: {
      settings: {
        preferThresholdMode: true,
      }
    }
  },
  disableStandardOptions: [
    FieldConfigProperty.NoValue,
  ]
});

plugin.setMigrationHandler((panel: any) => {
  const valueField = panel.options?.valueField;
  if (valueField !== undefined) {
    // Rename valueField to valueField1
    panel.options.valueField1 = valueField;
    delete panel.options.valueField;
  }

  const valueText = panel.options?.valueText;
  if (valueText !== undefined) {
    // Rename valueText to valueText1
    panel.options.valueText1 = valueText;
    delete panel.options.valueText;
  }

  if (panel.options?.addUrl) {
    // Update data link configuration
    let url = panel.options?.url;
    const sourceField = panel.options?.sourceField;
    const targetField = panel.options?.targetField;
    if (url !== undefined) {
      const urlVar1 = panel.options?.urlVar1;
      if (urlVar1 !== undefined && sourceField !== undefined) {
        url = url.concat('&var-' + urlVar1 + '=${__data.fields.'+sourceField+'}');
      }
      const urlVar2 = panel.options?.urlVar2;
      if (urlVar2 !== undefined && targetField !== undefined) {
        url = url.concat('&var-' + urlVar2 + '=${__data.fields.'+targetField+'}');
      }

      if (!panel.fieldConfig.defaults.links) {
        panel.fieldConfig.defaults.links = [];
      }
      panel.fieldConfig.defaults.links.push({
        'title': 'Show details',
        'url': url,
      });
    }

    delete panel.options.addUrl;
    delete panel.options.url;
    delete panel.options.urlVar1;
    delete panel.options.urlVar2;
  }

  return panel.options;
});

plugin.setPanelOptions((builder) => {
  /////////--------- Row and Column options ---------////////////////
  builder.addBooleanSwitch({
    path: 'inputList',
    name: 'Use Static Row/Column Lists',
    category: RowOptions,
    defaultValue: false,
  });
  builder.addTextInput({
    path: 'staticRows',
    name: 'Row Array',
    description: 'Terms to use as matrix rows (comma separated)',
    category: RowOptions,
    showIf: staticBool(true),
  });
  builder.addTextInput({
    path: 'staticColumns',
    name: 'Column Array',
    description: 'Terms to use as matrix columns (comma separated)',
    category: RowOptions,
    showIf: staticBool(true),
  });
  builder.addFieldNamePicker({
    path: 'sourceField',
    name: 'Rows Field',
    description: 'Select the field that should be used for the rows',
    category: RowOptions,
    settings: {
      filter: (field: Field) => field.type === FieldType.string,
    },
  });
  builder.addFieldNamePicker({
    path: 'targetField',
    name: 'Columns Field',
    description: 'Select the field to use for the columns',
    category: RowOptions,
    settings: {
      filter: (field: Field) => field.type === FieldType.string,
    },
  });
  builder.addRadio({
    path: 'values',
    name: 'Values',
    description: 'Number of values to display',
    category: RowOptions,
    settings: {
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
      ],
    },
    defaultValue: 1,
  });
  builder.addFieldNamePicker({
    path: 'valueField1',
    name: 'Value Field',
    description: 'Select the numeric field used to color the matrix cells.',
    category: RowOptions,
    settings: {
      filter: (field: Field) => field.type === FieldType.number,
    },
  });
  builder.addFieldNamePicker({
    path: 'valueField2',
    name: 'Second Value Field',
    description: 'Select the second numeric field used to color the matrix cells.',
    category: RowOptions,
    showIf: (c) => c.values >= 2,
    settings: {
      filter: (field: Field) => field.type === FieldType.number,
    },
  });

  ////////------------ General Matrix Options ----------------/////////////
  builder.addBooleanSwitch({
    path: 'showLegend',
    name: 'Show Legend',
    category: OptionsCategory,
    defaultValue: false,
  });
  builder.addSelect({
    path: 'legendType',
    name: 'Legend Type',
    category: OptionsCategory,
    showIf: legendBool(true),
    defaultValue: 'range',
    settings: {
      allowCustomValue: false,
      options: [
        { value: 'categorical', label: 'categorical' },
        { value: 'range', label: 'range' },
      ],
    },
  });
  builder.addTextInput({
    path: 'sourceText',
    name: 'Source Text',
    description: 'The text to be displayed in the tooltip.',
    category: OptionsCategory,
  });

  builder.addTextInput({
    path: 'targetText',
    name: 'Target Text',
    description: 'The text to be displayed in the tooltip.',
    category: OptionsCategory,
  });

  builder.addTextInput({
    path: 'valueText1',
    name: 'Value Text',
    description: 'The text to be displayed in the tooltip.',
    category: OptionsCategory,
  });

  builder.addTextInput({
    path: 'valueText2',
    name: 'Second Value Text',
    description: 'The text to be displayed in the tooltip.',
    category: OptionsCategory,
    showIf: (c) => c.values >= 2,
  });

  builder.addNumberInput({
    path: 'cellSize',
    name: 'Cell Size',
    description: 'Adjust the size in pixels that each matrix cell should use.',
    category: OptionsCategory,
    settings: {
      placeholder: 'Auto',
      integer: true,
      min: 10,
      max: 50,
    },
    defaultValue: 15,
  });

  builder.addNumberInput({
    path: 'cellPadding',
    name: 'Cell Padding',
    description:
      'Adjust the padding between the matrix cells. Note that this is a relative size and does not directly translate to pixels.',
    category: OptionsCategory,
    settings: {
      placeholder: 'Auto',
      integer: true,
      min: 0,
      max: 100,
    },
    defaultValue: 5,
  });

  builder.addNumberInput({
    path: 'txtLength',
    name: 'Text Length',
    description: 'adjust amount of space used for labels',
    category: OptionsCategory,
    settings: {
      placeholder: 'Auto',
      integer: true,
      min: 1,
      max: 300,
    },
    defaultValue: 50,
  });

  builder.addNumberInput({
    path: 'txtSize',
    name: 'Text Size',
    description: 'adjust the size of the text labels',
    category: OptionsCategory,
    settings: {
      placeholder: 'Auto',
      integer: true,
      min: 1,
      max: 200,
    },
    defaultValue: 10,
  });
  builder.addColorPicker({
    path: 'nullColor',
    name: 'Null Color',
    description: 'The color to use when the query returns a null value',
    category: OptionsCategory,
    defaultValue: '#E6E6E6',
  });
  builder.addColorPicker({
    path: 'defaultColor',
    name: 'No Data Color',
    description: 'The color to use when there is no data returned by the query',
    category: OptionsCategory,
    defaultValue: '#E6E6E6',
  });
});
