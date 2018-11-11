/* globals MashupPlatform, MockMP, beforeAll, afterAll, beforeEach */

(function () {

    "use strict";

    describe("NGSI Target operator should", function () {

        var operator;

        beforeAll(function () {
            window.MashupPlatform = new MockMP({
                type: 'operator',
                prefs: {
                    'ngsi_server': 'https://orion.example.com',
                    'fiware_service': 'Tenant',
                    'fiware_service_path': '/Spain/Madrid',
                    'use_owner_credentials': false,
                    'use_user_fiware_token': false
                },
                inputs: ['replaceentity', 'batchupdate'],
                outputs: ['updatedentity']
            });

            window.NGSI = {
                Connection: jasmine.createSpy('NGSI').and.callFake(function () {
                    this.v2 = {
                        deleteSubscription: jasmine.createSpy('deleteSubscription')
                    };
                })
            };
        });

        beforeEach(function () {
            MashupPlatform.reset();
            operator = new NGSITarget();
        });

        it("wait until the init method is called", function () {
            expect(operator.connection).toBe(null);
        });

        it("does register input endpoint callbacks on init", () => {
            operator.init();

            expect(operator.connection).not.toEqual(null);
            expect(MashupPlatform.wiring.registerCallback).toHaveBeenCalledWith("replaceentity", jasmine.any(Function));
            expect(MashupPlatform.wiring.registerCallback).toHaveBeenCalledWith("batchupdate", jasmine.any(Function));
            expect(NGSI.Connection).toHaveBeenCalledWith(
                "https://orion.example.com",
                {
                    use_user_fiware_token: false,
                    request_headers: {
                        "FIWARE-Service": "Tenant",
                        "FIWARE-ServicePath": "/Spain/Madrid",
                    }
                }
            );
        });

    });

})();
