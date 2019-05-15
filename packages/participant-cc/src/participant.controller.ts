import {ChaincodeTx} from '@worldsibu/convector-platform-fabric';
import {Controller, ConvectorController, Invokable, Param} from '@worldsibu/convector-core';

import {Participant} from './participant.model';

@Controller('participant')
export class ParticipantController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async create(
    @Param(Participant)
    participant: Participant
  ) {
    await participant.save();
  }
}