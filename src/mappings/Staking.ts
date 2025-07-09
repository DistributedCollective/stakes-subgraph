import {
  TokensStaked as TokensStakedEvent,
  TokensWithdrawn as TokensWithdrawnEvent,
  StakingWithdrawn as StakingWithdrawnEvent,
  ExtendedStakingDuration as ExtendedStakingDurationEvent
} from '../../generated/Staking/Staking'

import { loadActiveStakes } from '../entities/Staking'


export function handleTokensStaked(event: TokensStakedEvent): void {
  loadActiveStakes(event.params.staker, event)
}

export function handleTokensWithdrawn(event: TokensWithdrawnEvent): void {
  loadActiveStakes(event.params.staker, event)
}

export function handleStakingWithdrawn(event: StakingWithdrawnEvent): void {
  loadActiveStakes(event.params.staker, event)
}

export function handleExtendedStakingDuration(event: ExtendedStakingDurationEvent): void {
  loadActiveStakes(event.params.staker, event)
}
