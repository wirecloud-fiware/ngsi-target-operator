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

(function () {

    "use strict";

    /******************************************************************************/
    /********************************* PUBLIC *************************************/
    /******************************************************************************/

    var NGSITarget = function NGSITarget() {
        this.connection = null;
    };

    NGSITarget.prototype.init = function init() {
        createNGSIConnection.call(this);

        MashupPlatform.prefs.registerCallback(createNGSIConnection.bind(this));

        MashupPlatform.wiring.registerCallback('replaceentity', (entity) => {
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

        MashupPlatform.wiring.registerCallback('batchupdate', (updates) => {
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

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            request_headers['FIWARE-OAuth-Token'] = 'true';
            request_headers['FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            request_headers['FIWARE-OAuth-Source'] = 'workspaceowner';
        }

        var tenant = MashupPlatform.prefs.get('fiware_service').trim();
        if (tenant !== '') {
            request_headers['FIWARE-Service'] = tenant;
        }

        var path = MashupPlatform.prefs.get('fiware_service_path').trim();
        if (path !== '' && path !== '/') {
            request_headers['FIWARE-ServicePath'] = path;
        }

        this.connection = new NGSI.Connection(MashupPlatform.prefs.get('ngsi_server'), {
            use_user_fiware_token: MashupPlatform.prefs.get('use_user_fiware_token'),
            request_headers: request_headers
        });
    };

    /* import-block */
    window.NGSITarget = NGSITarget;
    /* end-import-block */

    /* TODO
     * this if is required for testing, but we have to search a cleaner way
     */
    if (window.MashupPlatform != null) {
        var ngsiTarget = new NGSITarget();
        ngsiTarget.init();
    }

})();
