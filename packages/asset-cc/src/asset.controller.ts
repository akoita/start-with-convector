import * as yup from "yup";
import { ChaincodeTx } from "@worldsibu/convector-platform-fabric";
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from "@worldsibu/convector-core";

import { Asset, AssetState, assetStateYupSchema } from "./asset.model";
import { Participant } from "participant-cc";

export interface AssetParams {
  id: string;
  name: string;
  value: string;
  ownerId: string;
}

export const assetParamsYupSchema = () =>
  yup.object().shape({
    id: yup.string(),
    name: yup.string(),
    value: yup.string(),
    ownerId: yup.string()
  });

@Controller("asset")
export class AssetController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async createAsset(
    @Param(assetParamsYupSchema())
    params: AssetParams
  ) {
    // check that there is not existing asset with the id
    const existing = await Asset.getOne(params.id);
    if (existing && existing.id) {
      throw new Error(`an asset already exists with the id "${params.id}"`);
    }

    // check that the owner of the asset exists
    const owner = await Participant.getOne(params.ownerId);
    if (!owner || !owner.id) {
      throw new Error(`no participant found with the id "${params.ownerId}"`);
    }

    await new Asset(params.id)
      .withName(params.name)
      .withOwnerId(params.ownerId)
      .withValue(params.value)
      .withState(AssetState.Open)
      .save();
  }

  @Invokable()
  public async closeAsset(@Param(yup.string()) id: string) {
    // check tha asset with the given id exists
    const asset = await Asset.getOne(id);
    if (!asset || !asset.id) {
      throw new Error(`no asset found with the id "${id}"`);
    }
    // check that the asset is not already closed
    if (asset.state === AssetState.Closed) {
      throw new Error(`the asset with the id "${asset.id}" is already closed`);
    }
    // check that the caller is the owner of the asset
    const assetOwner = await Participant.getOne(asset.ownerId);
    if (!assetOwner || !assetOwner.id) {
      throw new Error(
        `not able to found "${asset.ownerId}"the owner of the asset "${
          asset.id
        }"`
      );
    }
    const callerMSPID = this.tx.identity.getMSPID();
    const callerFingerprint = this.sender;
    if (
      assetOwner.msp !== callerMSPID ||
      assetOwner.x509Fingerprint !== callerFingerprint
    ) {
      throw new Error(
        `the caller identity does not match the asset "${
          asset.id
        }" owner identity`
      );
    }
    await asset.withState(AssetState.Closed).save();
  }

  @Invokable()
  public async getAssetById(@Param(yup.string()) id: string): Promise<Asset> {
    return await Asset.getOne(id);
  }

  @Invokable()
  public async getAllOpenAsset(): Promise<Asset[]> {
    return await this.getAllAssetInState(AssetState.Open);
  }

  @Invokable()
  public async getAllClosedAsset(): Promise<Asset[]> {
    return await this.getAllAssetInState(AssetState.Closed);
  }

  private async getAllAssetInState(
    @Param(assetStateYupSchema()) state: AssetState
  ): Promise<Asset[]> {
    const query = {
      selector: {
        $and: [{ type: Asset.TYPE }, { state: state }]
      },
      use_index: ["_design/indexAssetNameDoc", "indexAssetName"],
      sort: [{ name: "asc" }]
    };
    const assets = await Asset.query(Asset, JSON.stringify(query));
    if (Array.isArray(assets)) {
      return assets;
    } else {
      return [assets];
    }
  }
}
