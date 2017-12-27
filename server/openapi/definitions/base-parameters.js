const {
    AUTHORIZATION,
    ITEMS_PER_PAGE,
    PAGE_NUMBER,
    FILTER_FIELD_NAME,
    FILTER_VALUE,
    FILTER_ACTION,
} = require('../constants/params');

module.exports = {
    [AUTHORIZATION]: {
        name: 'Authorization',
        in: 'header',
        description: 'Contains string<br/> "Bearer token"',
        required: true,
        schema: {
            type: 'string'
        }
    },
    [ITEMS_PER_PAGE]: {
        name: ITEMS_PER_PAGE,
        in: 'query',
        description: 'Number of items per page. <br /><small>For example <b>25</b></small>',
        schema: {
            type: 'integer'
        }
    },
    [PAGE_NUMBER]: {
        name: PAGE_NUMBER,
        in: 'query',
        description: 'Current page number. <br /><small>For example <b>1</b></small>',
        schema: {
            type: 'integer'
        }
    },
    [FILTER_FIELD_NAME]: {
        name: FILTER_FIELD_NAME,
        in: 'query',
        description: `The field that should be used to filter the data
                    <br /><small>For example <b>Description</b></small>`,
        schema: {
            type: 'string'
        }
    },
    [FILTER_VALUE]: {
        name: FILTER_VALUE,
        in: 'query',
        description: `The value that should be used to filter the data.
                    <br /><small>For example <b>chicken</b></small>`,
        schema: {
            type: 'string'
        }
    },
    [FILTER_ACTION]: {
        name: FILTER_ACTION,
        in: 'query',
        description: `Filter behavior:
                    0 - the data should contain filterValue,
                    1 - the data should strictly match filterValue.
                    <br /><small>For example <b>0</b></small>`,
        schema: {
            type: 'integer'
        }
    }
};
