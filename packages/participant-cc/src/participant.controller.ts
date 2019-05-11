import * as yup from 'yup';
import {Controller, ConvectorController, Invokable, Param} from '@worldsibu/convector-core';

import {Participant} from './participant.model';

@Controller('participant')
export class ParticipantController extends ConvectorController {
  @Invokable()
  public async getParticipantById(@Param(yup.string())id: string): Promise<Participant> {
    const participant = await Participant.getOne(id);
    // a non-null or defined result doesn't mean that it is valid, the following check must still be done
    if (!participant || !participant.id) {
      return null;
    }
    return participant;
  }

  @Invokable()
  public async register(@Param(yup.string())id: string, @Param(yup.string()) name: string) {
    // Retrieve to see if exists
    const existing = await Participant.getOne(id);
    if (!existing || !existing.id) {
      const participant = new Participant();
      participant.id = id;
      participant.name = name;
      participant.msp = this.tx.identity.getMSPID();
      participant.x509Fingerprint = this.sender;
      await participant.save();
    } else {
      throw new Error(`a participant already exists with the id "${id}"`);
    }
  }

  @Invokable()
  public async changeIdentity(@Param(yup.string())id: string, @Param(yup.string())newIdentity: string) {
    // Check permissions
    let isAdmin = this.tx.identity.getAttributeValue('admin');
    let requesterMSP = this.tx.identity.getMSPID();

    // Retrieve to see if exists
    const existing = await Participant.getOne(id);
    if (!existing || !existing.id) {
      throw new Error(`No identity exists with the id "${id}"`);
    }
    if (existing.msp != requesterMSP) {
      throw new Error(`Unauthorized. The caller msp "${requesterMSP}" is different from the participant msp "${existing.msp}"`);
    }
    if (!isAdmin) {
      throw new Error('Unauthorized. Requester identity is not an admin');
    }
    existing.x509Fingerprint = newIdentity;
    await existing.save();
  }
}