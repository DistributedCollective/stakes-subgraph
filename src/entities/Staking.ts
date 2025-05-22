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
