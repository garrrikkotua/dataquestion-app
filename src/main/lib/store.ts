import Store from 'electron-store';

export interface StoreType {
  databaseList: Array<{
    name: string;
    type: string;
  }>;
  databaseSchemas: {
    [key: string]: {
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    };
  };
  openAIKey: string;
  licenseKey: string;
  isLicenseKeyValid: boolean;
}

export const AppStore = new Store<StoreType>({
  defaults: {
    databaseList: [],
    databaseSchemas: {},
    openAIKey: '',
    licenseKey: '',
    isLicenseKeyValid: false,
  },
  schema: {
    databaseList: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
    databaseSchemas: {
      type: 'object',
      patternProperties: {
        '.*': {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              table_name: { type: 'string' },
              column_name: { type: 'string' },
              data_type: { type: 'string' },
              is_nullable: { type: 'string' },
            },
          },
        },
      },
    },
    openAIKey: {
      type: 'string',
    },
    licenseKey: {
      type: 'string',
    },
    isLicenseKeyValid: {
      type: 'boolean',
    },
  },
});
