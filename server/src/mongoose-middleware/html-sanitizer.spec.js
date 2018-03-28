const sanitizer = require('./html-sanitizer');
const mongoose = require('mongoose');

describe('html-sanitizer', () => {
    const FakeSchema = new mongoose.Schema({
        textNode: {
            type: String
        },
        numberNode: {
            type: Number
        },
        boolNode: {
            type: Boolean
        },
        url: {
            type: String
        },
        subDoc: {
            label: {
                type: String
            },
            active: {
                type: Boolean
            }
        }
    });
    FakeSchema.plugin(sanitizer, {exclude: ['url']});
    const FakeModel = mongoose.model('Fake', FakeSchema);

    it('should sanitize all text and leave other stuff alone', (done) => {
        const url = 'https://foo.com/img.jpg';
        const fakeData = new FakeModel({
            textNode: '<script>foo</script> bar',
            numberNode: 1,
            boolNode: true,
            url: url,
            subDoc: {
                label: '<a>link</a>',
                active: false
            }
        });

        fakeData.validate(() => {
            expect(fakeData.textNode).toEqual('foo bar');
            expect(fakeData.numberNode).toEqual(1);
            expect(fakeData.boolNode).toEqual(true);
            expect(fakeData.url).toEqual(url);
            expect(fakeData.subDoc.label).toEqual('link');
            done();
        });
    });
});
