import * as yup from 'yup';
import {
  ConvectorModel,
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Participant extends ConvectorModel<Participant> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.participant';

  @Required()
  @Validate(yup.string())
  public name: string;

  @ReadOnly()
  @Validate(yup.string())
  public msp: string;

  @Required()
  @Validate(yup.string())
  public x509Fingerprint;
}
