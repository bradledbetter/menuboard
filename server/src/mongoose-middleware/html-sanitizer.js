const traverse = require('traverse');

/**
 * Sanitizing removes any mount of text between < and > by regex replace.
 * @param {string} str string to sanitize
 * @return {string} sanitized string
 */
function sanitize(str) {
    // first group should match any tags, second should match any comments
    return str.replace(/<(\/?[a-z]+[^>]*|\![^>]+)>/ig, '');
}

/**
 * Walks a document tree, html-sanitizing all string nodes in it.
 * Sanitizing removes any mount of text between < and > by regex replace. Maybe a bit harsh, but probably effective.
 * @param {object} schema the schema to sanitize
 * @param {object} options options to configure sanitizing. Currently available:
 *  exclude: [string] list of fields to exclude from sanitizing
 */
function sanitizerPlugin(schema, options) {
    // Set defaut options.
    options = options || {
        exclude: []
    };
    options.exclude = Array.isArray(options.exclude) ? options.exclude : [];

    schema.pre('validate', function(next) {
        const doc = JSON.parse(JSON.stringify(this._doc));

        // Sanitize every node in tree:
        const sanitized = traverse(doc).map(function(node) {
            if (typeof node === 'string') {
                const sanitizedNode = sanitize(node);
                this.update(sanitizedNode);
            }
        });

        // Exclude excludeped nodes:
        Object.keys(this._doc).forEach(function(node) {
            // Sanitize field unless explicitly excluded:
            if (!options.exclude.includes(node)) {
                this._doc[node] = sanitized[node];
            }
        }, this);

        next();
    });
};

module.exports = sanitizerPlugin;
