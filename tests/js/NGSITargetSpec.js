/*
 * Copyright (c) 2018 Future Internet Consulting and Development Solutions S.L.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

                expect(operator.connection.v2.replaceEntityAttributes).toHaveBeenCalledWith(updates);
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

                expect(operator.connection.v2.replaceEntityAttributes).toHaveBeenCalledWith(updates);
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
