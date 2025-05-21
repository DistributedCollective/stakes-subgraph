import {
  TokensStaked as TokensStakedEvent,
  WithdrawCall,
  SetWeightScalingCall,
  ExtendStakingDurationCall,
} from '../../generated/Staking/Staking'

import { BigInt} from '@graphprotocol/graph-ts'
import { createAndReturnTransaction, createAndReturnTransactionFromCall } from '../entities/Transaction'
import { Deposit, Extend, MaybeSlash, Withdraw } from '../../generated/schema'
import { createAndReturnUser } from '../entities/User'
import { createAndReturnStake, createAndReturnStaking } from '../entities/Staking'


export function handleTokensStaked(event: TokensStakedEvent): void {
    const transaction = createAndReturnTransaction(event)
    const user = createAndReturnUser(event.params.staker, event.block.timestamp)
    const id = event.transaction.hash.toHexString() + '-' + event.logIndex.toString()

    const stake = createAndReturnStake(
        event.params.staker,
        event.params.lockedUntil
    )

    stake.amount = stake.amount.plus(event.params.amount)
    stake.save()

    const deposit = new Deposit(id)
    deposit.stake = stake.id
    deposit.user = user.id

    deposit.amount = event.params.amount;
    deposit.transaction = transaction.id

    deposit.save();
}

export function handleWithdrawCall(call: WithdrawCall): void {
    const transaction = createAndReturnTransactionFromCall(call)
    const user = createAndReturnUser(call.from, call.block.timestamp)
    const id = call.transaction.hash.toHexString() + '-' + call.transaction.index.toString()

    const slash = MaybeSlash.load(transaction.id)
    const slashedAmount = slash == null ? BigInt.zero() : slash.amount

    const stake = createAndReturnStake(
        call.from,
        call.inputs.until
    )

    stake.amount = stake.amount.minus(call.inputs.amount).minus(slashedAmount)
    stake.save()

    const withdraw = new Withdraw(id)
    withdraw.stake = stake.id
    withdraw.user = user.id

    withdraw.amount = call.inputs.amount;
    withdraw.transaction = transaction.id

    withdraw.slash = slash == null ? null : slash.id

    withdraw.save();
}

export function handleExtendStakingDurationCall(call: ExtendStakingDurationCall): void {
    const transaction = createAndReturnTransactionFromCall(call)
    const user = createAndReturnUser(call.from, call.block.timestamp)
    const id = call.transaction.hash.toHexString() + '-' + call.transaction.index.toString()

    const oldStake = createAndReturnStake(
        call.from,
        call.inputs.previousLock
    )

    const newStake = createAndReturnStake(
        call.from,
        call.inputs.until
    )

    newStake.amount = oldStake.amount
    newStake.save()


    oldStake.amount = BigInt.zero()
    oldStake.save()

    const extend = new Extend(id)
    extend.user = user.id
    extend.stake = newStake.id
    extend.prevStake = oldStake.id
    extend.transaction = transaction.id

    extend.save();
}

export function handleSetWeightScalingCall(call: SetWeightScalingCall): void {
  const transaction = createAndReturnTransactionFromCall(call)

  const staking = createAndReturnStaking();
  staking.weightScaling = call.inputs._weightScaling;
  staking.transaction = transaction.id
  staking.save()
}
