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
                inputs: ['batchupdate', 'createorupdate', 'replaceentity'],
                outputs: ['updatedentity']
            });

            window.NGSI = {
                Connection: jasmine.createSpy('NGSI').and.returnValue({
                    v2: {
                        batchUpdate: jasmine.createSpy('batchUpdate'),
                        createEntity: jasmine.createSpy('createEntity'),
                        replaceEntityAttributes: jasmine.createSpy('replaceEntityAttributes')
                    }
                })
            };
        });

        beforeEach(function () {
            MashupPlatform.reset();
            operator = new NGSITarget();
            NGSI.Connection().v2.batchUpdate.calls.reset();
            NGSI.Connection().v2.createEntity.calls.reset();
            NGSI.Connection().v2.replaceEntityAttributes.calls.reset();
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

        describe("replaceentity", () => {

            it("calls replaceEntityAttributes", () => {
                let updates = {
                    "id": "entity1",
                    "type": "MyEntityType",
                    "newattribute": "value"
                };
                NGSI.Connection().v2.replaceEntityAttributes.and.callFake((entity) => {
                    return {
                        then: (listener) => {listener(entity);}
                    };
                });

                operator.init();
                replaceentity.call(operator, updates);

                expect(operator.connection.v2.replaceEntityAttributes).toHaveBeenCalledWith(updates, {keyValues: true});
                expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalledWith("updatedentity", updates);
            });

            it("supports string input", () => {
                let updates = {
                    "actionType": "APPEND",
                    "entities": [{
                        "id": "entity1",
                        "type": "MyEntityType",
                    }]
                };

                operator.init();
                replaceentity.call(operator, JSON.stringify(updates));

                expect(operator.connection.v2.replaceEntityAttributes).toHaveBeenCalledWith(updates, {keyValues: true});
                expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalledWith("updatedentity", updates);
            });

        });

        describe("createorupdate", () => {

            it("calls createEntity with the upsert option", () => {
                let entity = {
                    "id": "entity1",
                    "type": "MyEntityType",
                };

                operator.init();
                createorupdate.call(operator, entity);

                expect(operator.connection.v2.createEntity).toHaveBeenCalledWith(entity, jasmine.anything());
            });

            it("supports string input", () => {
                let entity = {
                    "id": "entity1",
                    "type": "MyEntityType",
                };

                operator.init();
                createorupdate.call(operator, JSON.stringify(entity));

                expect(operator.connection.v2.createEntity).toHaveBeenCalledWith(entity, jasmine.anything());
            });

        });

        describe("batchupdate", () => {

            it("calls batchUpdate", () => {
                let updates = {
                    "actionType": "APPEND",
                    "entities": [{
                        "id": "entity1",
                        "type": "MyEntityType",
                    }]
                };

                operator.init();
                batchupdate.call(operator, updates);

                expect(operator.connection.v2.batchUpdate).toHaveBeenCalledWith(updates);
            });

            it("supports string input", () => {
                let updates = {
                    "actionType": "APPEND",
                    "entities": [{
                        "id": "entity1",
                        "type": "MyEntityType",
                    }]
                };

                operator.init();
                batchupdate.call(operator, JSON.stringify(updates));

                expect(operator.connection.v2.batchUpdate).toHaveBeenCalledWith(updates);
            });

        });

    });

})();
