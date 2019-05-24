# Start with Convector
This project was created as part of a tutorial on [Convector](https://github.com/hyperledger-labs/convector), the TypeScript framework for creating [Hyperledger Fabric](https://www.hyperledger.org/projects/fabric) applications.

The project is composed of two chaincode packages, `packages/participant-cc` and `packages/asset-cc`. It allows organizations to create and share assets associated with participants as owners.

For more information on the context, see the tutorial page:

To install and test the project, follow the following steps.

## Install and test the project
To install and test the project, you must clone the repo and follow the following instructions.

### Prerequisites
* **Operating system**: The project has been tested on **ubuntu desktop 16.0 64-bits**, but it should work in any environment that supports Fabric and Convector.
* **Node.js**: Version 8.14.1. But other versions can work.
* **Docker**: 18.09.5
* **Docker-compose**: 1.23.1

### Install npm dependencies
While in the project directory, install the dependencies:
```
npm i
```
And start the unit tests:
```
npm test
```
### Create a Hyperledger Fabric development network with Hurley
[Hurley](https://github.com/worldsibu/hurley) is a toolset  of the Convector Suite that facilitates the management of a Fabric development environment. The first creation of a Fabric network will take time because it will start downloading docker images:
```
npm i -g @worldsibu/hurley
hurl new
```
### Build and deploy the chaincode in the Fabric network
The following command will build the deployment package of the chaincode and deploy it in the Fabric network:
```
npm run cc:start -- asset
```
### Invoke the deployed chaincode
Some invocations that can be made on the chaincode.
#### Create and request participants 
Note that the first invocation will take time because it will cause the instantiation of the chaincode. The following invocations will be much faster.
```
# create two participants
hurl invoke asset participant_register ptcp1 Damien
hurl invoke asset participant_register ptcp2 Booba

# request the participants by their id
hurl invoke asset participant_getParticipantById ptcp1
hurl invoke asset participant_getParticipantById ptcp2
```
#### Create and request assets
Create assets owned by previously created participants:
```
ASSET1_PARAMS='{"id":"as1","ownerId":"ptcp1","value":"Asset1Value","name":"Asset1Name"}'
ASSET2_PARAMS='{"id":"as2","ownerId":"ptcp1","value":"Asset2Value","name":"Asset2Name"}'
ASSET3_PARAMS='{"id":"as3","ownerId":"ptcp2","value":"Asset3Value","name":"Asset3Name"}'
ASSET4_PARAMS='{"id":"as4","ownerId":"ptcp2","value":"Asset4Value","name":"Asset4Name"}'

hurl invoke asset asset_createAsset $ASSET1_PARAMS
hurl invoke asset asset_createAsset $ASSET2_PARAMS
hurl invoke asset asset_createAsset $ASSET3_PARAMS
hurl invoke asset asset_createAsset $ASSET4_PARAMS
```

Request the list of open and closed assets:
```
# list of open assets (must return now the list of all assets)
hurl invoke asset asset_getAllOpenAsset

# list of closed assets (must return now an empty list)
hurl invoke asset asset_getAllClosedAsset
```
Let's close some assets:
```
hurl invoke asset asset_closeAsset as1
hurl invoke asset asset_closeAsset as2
``` 

Request again the list of open and closed assets:
```
# list of open assets (must return now the assets as3 and as4)
hurl invoke asset asset_getAllOpenAsset

# list of closed assets (must return now the assets as1 and as2)
hurl invoke asset asset_getAllClosedAsset
```

## Troubleshooting
In case of unexpected errors, you can reset the Fabric environment by starting from scratch:
```
hurl clean; hurl new
``` 
