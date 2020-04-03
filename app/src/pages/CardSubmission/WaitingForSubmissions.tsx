import * as React from "react"
import { Button } from "@material-ui/core"
import {
  useSubmittedCardsSubscription,
  GameStateEnum,
  useUpdateGameStateMutation,
  useUpdateAllPlayersMutation
} from "generated/graphql"
import { CurrentPlayerContext, PlayerRole } from "contexts/CurrentPlayer"
import { CurrentGameContext } from "contexts/CurrentGame"
import { teamsWithSequence } from "pages/TeamAssignment/team"

function WaitingForSubmissions() {
  const currentGame = React.useContext(CurrentGameContext)
  const currentPlayer = React.useContext(CurrentPlayerContext)
  const [updateGameState] = useUpdateGameStateMutation()
  const [updateAllPlayers] = useUpdateAllPlayersMutation()
  const { data } = useSubmittedCardsSubscription({
    variables: {
      gameId: currentGame.id
    }
  })

  const numEntriesPerPlayer = currentGame.num_entries_per_player
  const numPlayers = currentGame.players.length

  if (!numEntriesPerPlayer || !numPlayers) {
    return null
  }

  const total = numEntriesPerPlayer * numPlayers
  const submittedSoFar = data?.cards_aggregate.aggregate?.count
  const allPlayersSubmitted = total !== 0 && (submittedSoFar || 0) === total

  return (
    <>
      {allPlayersSubmitted ? (
        <div>
          All players submitted, waiting on the host ot start the game!
          {currentPlayer.role === PlayerRole.Host ? (
            <Button
              onClick={async () => {
                const players = teamsWithSequence(currentGame.players)
                await updateAllPlayers({
                  variables: {
                    gameId: currentGame.id,
                    players: players.map(({ id, team, team_sequence }) => ({
                      id,
                      team,
                      team_sequence
                    }))
                  }
                })
                updateGameState({
                  variables: {
                    id: currentGame.id,
                    state: GameStateEnum.TeamAssignment
                  }
                })
              }}
            >
              Assign Teams
            </Button>
          ) : null}
        </div>
      ) : (
        <div>
          <div>Waiting for other players</div>
          <div>
            {submittedSoFar}/{total}
          </div>
        </div>
      )}
    </>
  )
}

export default WaitingForSubmissions
