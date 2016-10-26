/*
 * Copyright (c) 2013-2016 CoNWeT Lab., Universidad Politécnica de Madrid
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

        mp.wiring.registerCallback('entityInput', function (data) {
            // TODO
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            var entity = {
                id: data.id,
                type: data.type
            };
            delete data.id;
            delete data.type;

            var attributes = [];
            Object.keys(data).forEach(function (key) {
                attributes.push({name: key, contextValue: data[key]});
            });
            this.connection.addAttributes(
                [{entity: entity, attributes: attributes}]
            );
        }.bind(this));
    };

    /******************************************************************************/
    /********************************* PRIVATE ************************************/
    /******************************************************************************/

    var createNGSIConnection = function createNGSIConnection() {
        var request_headers = {};

        if (mp.prefs.get('use_owner_credentials')) {
            request_headers['X-FIWARE-OAuth-Token'] = 'true';
            request_headers['X-FIWARE-OAuth-Header-Name'] = 'X-Auth-Token';
            request_headers['x-FIWARE-OAuth-Source'] = 'workspaceowner';
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
