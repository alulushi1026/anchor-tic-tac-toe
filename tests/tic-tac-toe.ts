import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TicTacToe } from "../target/types/tic_tac_toe";
import { expect } from 'chai';

async function play(program: Program<TicTacToe>, game, player,
  tile, expectedTurn, expectedGameState, expectedBoard) {
    await program.methods
      .play(tile)
      .accounts({
        player: player.publicKey,
        game
      })
      .signers(player instanceof (anchor.Wallet as any) ? [] : [player])
      .rpc();

    const gameState = await program.account.game.fetch(game);
    expect(gameState.turn).to.equal(expectedTurn);
    expect(gameState.state).to.eql(expectedGameState);
    expect(gameState.board)
      .to
      .eql(expectedBoard);
  }

describe("tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TicTacToe as Program<TicTacToe>;

  it('setup game!', async() => {
    const gameKeyPair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();
    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeyPair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeyPair])
      .rpc();

    let gameState = await program.account.game.fetch(gameKeyPair.publicKey);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players)
      .to
      .eql([playerOne.publicKey, playerTwo.publicKey]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board)
      .to
      .eql([[null,null,null],[null,null,null],[null,null,null]]);

  });

  it('player one wins', async () => {
    const gameKeyPair = anchor.web3.Keypair.generate();
    const playerOne = (program.provider as anchor.AnchorProvider).wallet;
    const playerTwo = anchor.web3.Keypair.generate();
    await program.methods
      .setupGame(playerTwo.publicKey)
      .accounts({
        game: gameKeyPair.publicKey,
        playerOne: playerOne.publicKey,
      })
      .signers([gameKeyPair])
      .rpc();

    let gameState = await program.account.game.fetch(gameKeyPair.publicKey);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players)
      .to
      .eql([playerOne.publicKey, playerTwo.publicKey]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board)
      .to
      .eql([[null,null,null],[null,null,null],[null,null,null]]);

    await play(
          program,
          gameKeyPair.publicKey,
          playerOne,
          {row: 0, column: 0},
          2,
          { active: {}, },
          [
            [{x:{}},null,null],
            [null,null,null],
            [null,null,null]
          ]
        );

  });
});
