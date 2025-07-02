import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Stake, Staking } from "../../generated/schema";
import { Staking as StakingContract } from "../../generated/Staking/Staking";
import { createAndReturnUser } from "./User";
import { STAKING_CONTRACT } from "../contracts";
import { createAndReturnTransaction } from "./Transaction";

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

export function loadActiveStakes(address: Address, event: ethereum.Event): void {

  const holder = createAndReturnUser(address, event.block.timestamp);
  const transaction = createAndReturnTransaction(event);

  const currentStakes = holder.stakes.load();

  const contract = StakingContract.bind(STAKING_CONTRACT)

  const newStakes = contract.getStakes(address);

  const newDates = newStakes.getDates();
  const newAmounts = newStakes.getStakes();

  // Remove "current" stakes that are not in the new list anymore
  for (let i = 0; i < currentStakes.length; i++) {
    const id = currentStakes[i].id;
    const date = currentStakes[i].lockedUntil;
    const existsInNewStakes = newDates.includes(date);
    if (!existsInNewStakes) {
      // Set the amount to zero and update the stake
      const stake = Stake.load(id);
      if (stake !== null) {
        stake.amount = BigInt.zero();
        stake.updatedAt = event.block.timestamp.toI32();
        stake.transaction = transaction.id;
        stake.save();
      }
    }
  }

  // Create or update stakes based on the new list
  for (let i = 0; i < newDates.length; i++) {
    const date = newDates[i];
    const amount = newAmounts[i];
    const id = address.toHexString() + "-" + date.toString();

    let stake = Stake.load(id);
    if (stake == null) {
      stake = new Stake(id);
      stake.user = holder.id;
      stake.lockedUntil = date;
      stake.createdAt = event.block.timestamp.toI32();
    }
    stake.amount = amount;
    stake.transaction = transaction.id;
    stake.updatedAt = event.block.timestamp.toI32();

    stake.save();
  }
}
