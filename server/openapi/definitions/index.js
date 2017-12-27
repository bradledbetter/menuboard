/* eslint-disable */
module.exports = {
    parameters: require('./base-parameters'),
    schemas: {
        AttributeSchema: require('./attribute.schema'),
        ErrorSchema: require('./error.schema'),
        EventSchema: require('./event.schema'),
        ImageSchema: require('./image.schema'),
        MenuSchema: require('./menu.schema'),
        MenuItemSchema: require('./menu-item.schema'),
        SlideSchema: require('./slide.schema'),
        SlideTypeSchema: require('./slide-type.schema'),
        SlideshowSchema: require('./slideshow.schema'),
        SuccessSchema: require('./success.schema'),
        UserSchema: require('./user.schema')
    },
    responses: require('./base-responses')
};