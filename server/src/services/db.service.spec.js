const mongoose = require('mongoose');
const db = require('./db.service');

describe('db service', function() {
    afterEach(function() {
        db.disconnect();
    });

    it('should call mongoose.connect on connect', function() {
        spyOn(mongoose, 'connect').and.callFake(function() {
            return {
                then: function(success) {
                    success({});
                    return {
                        catch: function() {}
                    };
                },
            };
        });

        db.connect();
        expect(mongoose.connect).toHaveBeenCalled();
    });

    it('should log an error when mongoose.connect fails', function() {
        spyOn(mongoose, 'connect').and.callFake(function() {
            return {
                then: function(success, failure) {
                    failure('there was an error');
                    return {
                        catch: function() {}
                    };
                },
            };
        });
        const logger = require('./logger.service');
        spyOn(console, 'error');
        spyOn(logger, 'error');

        let localErr;
        try {
            db.connect();
        } catch (err) {
            localErr = err;
        }
        expect(mongoose.connect).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalled();
        expect(localErr).toBeDefined();
    });

    it('should call mongoose.connection.close on disconnect()', function() {
        db.connect();
        if (mongoose.connection) {
            spyOn(mongoose.connection, 'close');
            db.disconnect();
            expect(mongoose.connection.close).toHaveBeenCalled();
        } else {
            // force a failure, because something is messed up
            expect(false).toBe(true);
        }
    })
});
