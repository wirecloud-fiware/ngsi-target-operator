## Introduction

The NGSI target operator is a [WireCloud operator](http://wirecloud.readthedocs.org/en/latest/) usable for making
context changes using the NGSI API.


## Settings

- **NGSI server URL:** URL of the Orion Context Broker to use for retrieving
  entity information.
- **Use the FIWARE credentials of the user:** Use the FIWARE credentials of the
  user logged into WireCloud. Take into account this option cannot be enabled if
  you want to use this widget in a public workspace as anonoymous users doesn't
  have a valid FIWARE auth token. As an alternative, you can make use of the
  "Use the FIWARE credentials of the workspace owner" preference.
- **Use the FIWARE credentials of the dashboard owner**: Use the FIWARE
  credentials of the owner of the workspace. This preference takes preference
  over "Use the FIWARE credentials of the user". This feature is available on
  WireCloud 0.7.0+ in a experimental basis, future versions of WireCloud can
  change the way to use it making this option not funcional and requiring you to
  upgrade this operator.
- **FIWARE-Service**: Tenant/service to use when connecting to the context
  broker. Must be a string of alphanumeric characters (lowercase) and the `_`
  symbol. Maximum length is 50 characters. If empty, the default tenant will be
  used.
- **FIWAREServicePath**: Scope/path to use when connecting to the context broker.
  Must be a string of alphanumeric characters (lowercase) and the `_` symbol
  separated by `/` slashes. Maximum length is 50 characters. If empty, the
  default service path will be used: `/`


## Wiring

Input Endpoints:

-   **Batch update:** Sends a batch update operation to the configured context
    broker.

        :::json
        {
            "id": "van4",
            "type": "Van",
            "current_position": "43.47173, -3.7967205"
        }

-   **Create or update**: Creates or updates a new entity on the configured
    context broker.
-   **Replace**: Creates or replaces an entity on the configured context broker.

Output Endpoints:

-   **Updated entities**: Entities once stored into the context broker. This
    endpoint is currntly used only when a successful replace operation is
    detected.


## References

* [FIWARE Catalogue][https://www.fiware.org/developers/catalogue/]
