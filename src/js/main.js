/*
 * Copyright (c) 2013-2017 CoNWeT Lab., Universidad Politécnica de Madrid
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

/* globals MashupPlatform, NGSI */

(function (mp) {

    "use strict";

    /******************************************************************************/
    /********************************* PUBLIC *************************************/
    /******************************************************************************/

    var NGSITarget = function NGSITarget() {
    };

    NGSITarget.prototype.init = function init() {
        createNGSIConnection.call(this);

        mp.prefs.registerCallback(createNGSIConnection.bind(this));

        mp.wiring.registerCallback('replaceentity', (entity) => {
            if (typeof entity === "string") {
                try {
                    entity = JSON.parse(entity);
                } catch (e) {
                    throw new MashupPlatform.wiring.EndpointTypeError();
                }
            }
            this.connection.v2.replaceEntityAttributes(entity).then(() => {
                MashupPlatform.wiring.pushEvent("updatedentity", entity);
            });
        });

        mp.wiring.registerCallback('batchupdate', (updates) => {
            if (typeof updates === "string") {
                try {
                    updates = JSON.parse(updates);
                } catch (e) {
                    throw new MashupPlatform.wiring.EndpointTypeError();
                }
            }
            this.connection.v2.batchUpdate(updates);
        });
    };

    /******************************************************************************/
    /********************************* PRIVATE ************************************/
    /******************************************************************************/

    var createNGSIConnection = function createNGSIConnection() {
        var request_headers = {};

        if (mp.prefs.get('use_owner_credentials')) {
            request_headers['FIWARE-OAuth-Token'] = 'true';
            request_headers['FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            request_headers['FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        var tenant = mp.prefs.get('ngsi_tenant').trim().toLowerCase();
        if (tenant !== '') {
            request_headers['FIWARE-Service'] = tenant;
        }

        var path = mp.prefs.get('ngsi_service_path').trim().toLowerCase();
        if (path !== '' && path !== '/') {
            request_headers['FIWARE-ServicePath'] = path;
        }

        this.connection = new NGSI.Connection(mp.prefs.get('ngsi_server'), {
            use_user_fiware_token: mp.prefs.get('use_user_fiware_token'),
            request_headers: request_headers
        });
    };

    var ngsiTarget = new NGSITarget();
    ngsiTarget.init();

})(MashupPlatform);
