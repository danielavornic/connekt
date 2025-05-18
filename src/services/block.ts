import { Driver } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { blockQueries } from "../queries/block";
import { Block, CreateBlockInput } from "../types/block";

interface CreateBlockData extends CreateBlockInput {
  createdBy: string;
}

export class BlockService {
  private driver: Driver;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async createBlock(data: CreateBlockData): Promise<Block> {
    const session = this.driver.session();

    try {
      const now = new Date().toISOString();
      const blockId = uuidv4();

      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.createBlock, {
          blockId,
          channelId: data.channelId,
          title: data.title ?? null,
          description: data.description ?? null,
          content: data.content,
          createdBy: data.createdBy,
          now,
        })
      );

      const block = result.records[0]?.get("block");
      if (!block) throw new Error("Failed to create block");

      return block;
    } finally {
      await session.close();
    }
  }

  async findBlockById(blockId: string): Promise<Block | null> {
    const session = this.driver.session();

    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.findBlockById, { blockId })
      );

      const block = result.records[0]?.get("block");
      return block || null;
    } finally {
      await session.close();
    }
  }

  async findBlocksByChannelId(channelId: string): Promise<Block[]> {
    const session = this.driver.session();

    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.findBlocksByChannelId, { channelId })
      );

      return result.records.map((record) => record.get("block"));
    } finally {
      await session.close();
    }
  }
}
