import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Stake, Staking } from "../../generated/schema";
import { Staking as StakingContract } from "../../generated/Staking/Staking";
import { createAndReturnUser } from "./User";
import { STAKING_CONTRACT } from "../contracts";

export function createAndReturnStaking(): Staking {
  let staking = Staking.load(Address.zero().toHexString());

  if (staking == null) {
    const contract = StakingContract.bind(STAKING_CONTRACT)

    staking = new Staking(Address.zero().toHexString());

    staking.kickoffTS = contract.kickoffTS().toI32()
    staking.weightScaling = contract.weightScaling()

    staking.save()
  }

  return staking;
}

export function createAndReturnStake(
  address: Address,
  lockedUntil: BigInt
): Stake {
  const id = address.toHexString() + "-" + lockedUntil.toString();
  let stake = Stake.load(id);
  if (stake == null) {
    stake = new Stake(id);
    stake.user = createAndReturnUser(address, lockedUntil).id;
    stake.lockedUntil = lockedUntil;
    stake.amount = BigInt.fromI32(0);
    stake.save();
  }
  return stake;
}
