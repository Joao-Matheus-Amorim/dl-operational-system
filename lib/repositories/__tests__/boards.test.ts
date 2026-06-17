import { describe, it, expect } from "vitest";
import {
  createBoard,
  createBoardCard,
  deleteBoard,
  deleteBoardCard,
  getBoardDetail,
  listBoards,
  updateBoardCard,
} from "@/lib/repositories/boards";

describe("boards repository (mock mode)", () => {
  it("creates and deletes a board", async () => {
    const board = await createBoard("Quadro Teste");
    expect(board.title).toBe("Quadro Teste");
    expect((await listBoards()).some((item) => item.id === board.id)).toBe(true);

    await deleteBoard(board.id);
    expect((await listBoards()).some((item) => item.id === board.id)).toBe(false);
  });

  it("creates, edits and deletes a card", async () => {
    const board = await createBoard("Quadro Cards");

    const card = await createBoardCard({
      boardId: board.id,
      columnId: "col-1",
      title: " Card ",
      position: 0,
    });
    expect(card.title).toBe("Card");

    const updated = await updateBoardCard(card.id, {
      boardId: board.id,
      title: "Card 2",
      description: "  desc  ",
    });
    expect(updated.title).toBe("Card 2");
    expect(updated.description).toBe("desc");

    await deleteBoardCard(card.id, board.id);
    const detail = await getBoardDetail(board.id);
    expect(detail.cards.some((item) => item.id === card.id)).toBe(false);
  });

  it("rejects an empty card title on update", async () => {
    const board = await createBoard("Quadro Validacao");
    const card = await createBoardCard({
      boardId: board.id,
      columnId: "col-1",
      title: "x",
      position: 0,
    });

    await expect(
      updateBoardCard(card.id, { boardId: board.id, title: "   " })
    ).rejects.toThrow();
  });
});
