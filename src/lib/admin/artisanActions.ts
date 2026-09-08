import type { Status } from '@/lib/data'

export type ActionKind = 'approve' | 'reject' | 'reinstate'

export interface StatusAction {
  kind: ActionKind
  /** The status this action moves the artisan to. */
  next: Status
  /**
   * Whether to ask first.
   *
   * ONLY when the action changes what the public can see. Approving a pending
   * artisan publishes a profile; rejecting an approved one takes a live profile
   * away from buyers who may be linking to it. Both deserve a pause.
   *
   * Rejecting an artisan who is already pending changes nothing a buyer can
   * see - they were invisible before and remain invisible - so a dialog there
   * would be ceremony. Worse, it would be the third identical dialog in a
   * session, which is how people learn to click through the one that matters.
   */
  confirm: boolean
}

/**
 * What can be done to an artisan in a given state (PRD 11.7: "row actions to
 * change status").
 *
 * This table is not the queue. The queue answers one question about something
 * new; here every artisan is listed in whatever state they are in, so an action
 * can move them in any direction - including un-approving someone already
 * public, or reinstating someone previously turned away.
 *
 * A status is never offered as an action against itself: an approved artisan
 * has no "approve" button. Nothing here is irreversible, which is what makes a
 * single confirm enough rather than a typed confirmation.
 */
export function actionsFor(status: Status): StatusAction[] {
  switch (status) {
    case 'pending':
      return [
        { kind: 'approve', next: 'approved', confirm: true },
        { kind: 'reject', next: 'rejected', confirm: false },
      ]
    case 'approved':
      // Only one action: taking a public profile down. Always confirmed.
      return [{ kind: 'reject', next: 'rejected', confirm: true }]
    case 'rejected':
      // Reinstating returns them to the queue rather than straight to public,
      // so it is a smaller step than it looks and needs no dialog.
      return [{ kind: 'reinstate', next: 'pending', confirm: false }]
  }
}
