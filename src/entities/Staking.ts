import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Stake, Staking } from "../../generated/schema";
import { createAndReturnUser } from "./User";

export function createAndReturnStaking(): Staking {
  let staking = Staking.load(Address.zero().toHexString());

  if (staking == null) {
    staking = new Staking(Address.zero().toHexString());
  }

  return staking;
}

export function createAndReturnStake(
  address: Address,
  lockedUntil: BigInt
): Stake {
  let stake = Stake.load(address.toHexString() + "-" + lockedUntil.toString());
  if (stake == null) {
    stake = new Stake(address.toHexString());
    stake.user = createAndReturnUser(address, lockedUntil).id;
    stake.lockedUntil = lockedUntil;
    stake.amount = BigInt.fromI32(0);
    stake.save();
  }
  return stake;
}
