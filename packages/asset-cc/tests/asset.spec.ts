// tslint:disable:no-unused-expression
import { join } from "path";
import * as uuid from "uuid/v4";
import { MockControllerAdapter } from "@worldsibu/convector-adapter-mock";
import {
  ClientFactory,
  ConvectorControllerClient
} from "@worldsibu/convector-core";
import "mocha";
import * as chai from "chai";
import { expect } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { Builder } from "builder-pattern";

import { Asset, AssetController, AssetParams, AssetState } from "../src";
import { ParticipantController } from "participant-cc";

function extractParams(asset: Asset): AssetParams {
  return Builder<AssetParams>()
    .id(asset.id)
    .ownerId(asset.ownerId)
    .value(asset.value)
    .name(asset.name)
    .build();
}

describe("Asset", () => {
  chai.use(chaiAsPromised);

  let adapter: MockControllerAdapter;
  let assetCtrl: ConvectorControllerClient<AssetController>;
  let participantCtrl: ConvectorControllerClient<ParticipantController>;
  let asset1Params;
  let asset2Params;
  let asset3Params;
  let asset4Params;

  const fakeParticipantCert =
    "-----BEGIN CERTIFICATE-----\n" +
    "MIICKDCCAc6gAwIBAgIRAKpIbs0yLYy65JIrr9irtugwCgYIKoZIzj0EAwIwcTEL\n" +
    "MAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\n" +
    "cmFuY2lzY28xGDAWBgNVBAoTD29yZzEuaHVybGV5LmxhYjEbMBkGA1UEAxMSY2Eu\n" +
    "b3JnMS5odXJsZXkubGFiMB4XDTE5MDUwMzEzMjQwMFoXDTI5MDQzMDEzMjQwMFow\n" +
    "azELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\n" +
    "biBGcmFuY2lzY28xDzANBgNVBAsTBmNsaWVudDEeMBwGA1UEAwwVVXNlcjFAb3Jn\n" +
    "MS5odXJsZXkubGFiMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5QS5zZd5kIlr\n" +
    "lCceMAShpkryJr3LKlev/fblhc76C6x6jfbWsYx4eilqDKGmGtoP/DL/ubiHtWxW\n" +
    "ncRs5tuu7KNNMEswDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwKwYDVR0j\n" +
    "BCQwIoAgOrfdQBvYqeJMP2kSeYMs454SgMM0UMxVMX3smJhq1T0wCgYIKoZIzj0E\n" +
    "AwIDSAAwRQIhAKuLQTEpu7OUJVepcKR8/4agjQzP5m5dbyOhZUPi7HKzAiBromIn\n" +
    "dH9+KtMkM6VNbtSP54kS5idQg+1lXSal76P98A==\n" +
    "-----END CERTIFICATE-----\n";
  const fakeAdminCert =
    "-----BEGIN CERTIFICATE-----\n" +
    "MIIC7DCCApOgAwIBAgIUcg3DffC8hY03iz6zRC6GZQUch7EwCgYIKoZIzj0EAwIw\n" +
    "cTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\n" +
    "biBGcmFuY2lzY28xGDAWBgNVBAoTD29yZzEuaHVybGV5LmxhYjEbMBkGA1UEAxMS\n" +
    "Y2Eub3JnMS5odXJsZXkubGFiMB4XDTE5MDUwNjA4NDEwMFoXDTIwMDUwNTA4NDYw\n" +
    "MFowfzELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYD\n" +
    "VQQKEwtIeXBlcmxlZGdlcjEwMA0GA1UECxMGY2xpZW50MAsGA1UECxMEb3JnMTAS\n" +
    "BgNVBAsTC2RlcGFydG1lbnQxMQ8wDQYDVQQDEwZhZG1pbjIwWTATBgcqhkjOPQIB\n" +
    "BggqhkjOPQMBBwNCAATdhgd0fRPq4AYSvS9tiS7vcZamCG3PDAb0QM4UGyFADdWi\n" +
    "RsQjglz2/MnId4rLkU6srIAJUhDZI+QYGGkDhZlBo4H6MIH3MA4GA1UdDwEB/wQE\n" +
    "AwIHgDAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBSbHq5DcRCcBt0+y4miDuzLOq80\n" +
    "8TArBgNVHSMEJDAigCD9XKUjIbuooHek1fmgbE768dWTkHdGpqGn8v/YEeBbyDAR\n" +
    "BgNVHREECjAIggZ1YnVudHUweAYIKgMEBQYHCAEEbHsiYXR0cnMiOnsiYWRtaW4i\n" +
    "OiJ0cnVlIiwiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1lbnQxIiwiaGYu\n" +
    "RW5yb2xsbWVudElEIjoiYWRtaW4yIiwiaGYuVHlwZSI6ImNsaWVudCJ9fTAKBggq\n" +
    "hkjOPQQDAgNHADBEAiAzUQos0hPVPf3DuZaCW3gX+LlxL2G5d7iY1ZUh1murgwIg\n" +
    "dkQIssMaMwkireuglUubT/Chee4jFgnhJqffnG+qCHs=\n" +
    "-----END CERTIFICATE-----\n";

  beforeEach(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    assetCtrl = ClientFactory(AssetController, adapter);
    participantCtrl = ClientFactory(ParticipantController, adapter);

    await adapter.init([
      {
        version: "*",
        controller: "AssetController",
        name: join(__dirname, "..")
      },
      {
        version: "*",
        controller: "ParticipantController",
        name: join(__dirname, "..", "..", "participant-cc")
      }
    ]);
    (adapter.stub as any).usercert = fakeParticipantCert;

    // create default participant
    await participantCtrl.register("Participant1", "Participant1Name");

    asset1Params = Builder<AssetParams>()
      .id("Asset1")
      .ownerId("Participant1")
      .value("Asset1Value")
      .name("Asset1Name")
      .build();
    asset2Params = Builder<AssetParams>()
      .id("Asset2")
      .ownerId("Participant1")
      .value("Asset2Value")
      .name("Asset2Name")
      .build();
    asset3Params = Builder<AssetParams>()
      .id("Asset3")
      .ownerId("Participant1")
      .value("Asset3Value")
      .name("Asset3Name")
      .build();
    asset4Params = Builder<AssetParams>()
      .id("Asset4")
      .ownerId("Participant1")
      .value("Asset4Value")
      .name("Asset4Name")
      .build();
  });

  it("should create an asset", async () => {
    await assetCtrl.createAsset(asset1Params);
    const asset = await assetCtrl
      .getAssetById("Asset1")
      .then(res => new Asset(res));
    expect(asset).to.include(asset1Params);
  });

  it("should fail to create an asset with a non-existing owner", async () => {
    asset1Params.ownerId = "non-existing-owner-id";
    await expect(
      assetCtrl
        .createAsset(asset1Params)
        .catch(ex => ex.responses[0].error.message)
    ).to.be.eventually.equal(
      'no participant found with the id "non-existing-owner-id"'
    );
  });

  it("should close an open asset", async () => {
    await assetCtrl.createAsset(asset1Params);
    const asset = await assetCtrl
      .getAssetById("Asset1")
      .then(res => new Asset(res));
    expect(asset).to.include(asset1Params);
    expect(asset.state).to.be.eql(AssetState.Open);
    // now close asset
    await assetCtrl.closeAsset("Asset1");
    const assetClosed = await assetCtrl
      .getAssetById("Asset1")
      .then(res => new Asset(res));
    expect(assetClosed).to.include(asset1Params);
    expect(assetClosed.state).to.be.eql(AssetState.Closed);
  });

  it("should fail to close the asset when the caller is not the owner", async () => {
    await assetCtrl.createAsset(asset1Params);
    const asset = await assetCtrl
      .getAssetById("Asset1")
      .then(res => new Asset(res));
    expect(asset).to.include(asset1Params);
    expect(asset.state).to.be.eql(AssetState.Open);
    // now we change the caller identity and we try to close the asset
    (adapter.stub as any).usercert = fakeAdminCert;
    await expect(
      assetCtrl.closeAsset("Asset1").catch(ex => ex.responses[0].error.message)
    ).to.be.eventually.equal(
      'the caller identity does not match the asset "Asset1" owner identity'
    );
  });

  it("should return assets following the state", async () => {
    await assetCtrl.createAsset(asset1Params);
    await assetCtrl.createAsset(asset2Params);
    await assetCtrl.createAsset(asset3Params);
    await assetCtrl.createAsset(asset4Params);

    let openAssets = await assetCtrl.getAllOpenAsset();
    let closedAssets = await assetCtrl.getAllClosedAsset();
    expect(openAssets).to.have.lengthOf(4);
    expect(
      openAssets.map(asset => extractParams(new Asset(asset)))
    ).to.have.same.deep.members([
      asset1Params,
      asset2Params,
      asset3Params,
      asset4Params
    ]);
    expect(closedAssets).to.be.empty;

    await assetCtrl.closeAsset(asset1Params.id);
    openAssets = await assetCtrl.getAllOpenAsset();
    closedAssets = await assetCtrl.getAllClosedAsset();
    expect(openAssets).to.have.lengthOf(3);
    expect(
      openAssets.map(asset => extractParams(new Asset(asset)))
    ).to.have.same.deep.members([asset2Params, asset3Params, asset4Params]);
    expect(
      closedAssets.map(asset => extractParams(new Asset(asset)))
    ).to.have.same.deep.members([asset1Params]);

    await assetCtrl.closeAsset(asset2Params.id);
    await assetCtrl.closeAsset(asset3Params.id);
    await assetCtrl.closeAsset(asset4Params.id);
    openAssets = await assetCtrl.getAllOpenAsset();
    closedAssets = await assetCtrl.getAllClosedAsset();
    expect(openAssets).to.be.empty;
    expect(closedAssets).to.have.lengthOf(4);
    expect(
      closedAssets.map(asset => extractParams(new Asset(asset)))
    ).to.have.same.deep.members([
      asset1Params,
      asset2Params,
      asset3Params,
      asset4Params
    ]);
  });
});
