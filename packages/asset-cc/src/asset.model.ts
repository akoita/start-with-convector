import * as yup from "yup";
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate
} from "@worldsibu/convector-core-model";

export enum AssetState {
  Open = "Open",
  Closed = "Closed"
}

export const assetStateYupSchema = () =>
  yup.string().oneOf(Object.keys(AssetState).map(k => AssetState[k]));

export class Asset extends ConvectorModel<Asset> {
  public static readonly TYPE = "io.worldsibu.asset";
  @ReadOnly()
  @Required()
  public readonly type = Asset.TYPE;

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public name: string;

  @Required()
  @Validate(yup.string())
  public value: string;

  @Required()
  @Validate(assetStateYupSchema())
  public state: AssetState;

  @Required()
  @Validate(yup.string())
  public ownerId: string;

  public withId(id: string): this {
    this.id = id;
    return this;
  }

  public withName(name: string): this {
    this.name = name;
    return this;
  }

  public withValue(value: string): this {
    this.value = value;
    return this;
  }

  public withState(state: AssetState): this {
    this.state = state;
    return this;
  }

  public withOwnerId(ownerId: string): this {
    this.ownerId = ownerId;
    return this;
  }
}
