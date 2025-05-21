import { MaybeSlash } from "../../generated/schema"
import { TokensTransferred as TokensTransferredEvent } from "../../generated/FeeSharingProxy/FeeSharingProxy"

export function handleTokensTransferred(event: TokensTransferredEvent): void {
  /** If this event occurs in the same transaction as a StakingWithdrawn or TokensWithdrawn event on the staking contract, it means the user unstaked their SOV early
   * This event is emitted when the "slashing" penalty for early unstaking occurs
   * This event is emitted BEFORE TokensWithdrawn
   */

  const slash = new MaybeSlash(event.transaction.hash.toHexString())
  slash.sender = event.params.sender
  slash.token = event.params.token
  slash.amount = event.params.amount
  slash.save()
}

