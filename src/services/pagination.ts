import { Session, int } from "neo4j-driver";

export interface PaginatedQueryResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
}

export interface PaginationParams {
  query?: string;
  limit?: number;
  offset?: number;
  [key: string]: any;
}

export async function executePaginatedQuery<T>(
  session: Session,
  query: string,
  params: PaginationParams
): Promise<PaginatedQueryResult<T>> {
  const queryParams = {
    ...params,
    limit: int(params.limit ?? 10),
    offset: int(params.offset ?? 0),
  };

  if (params.query) {
    queryParams.query = `(?i).*${params.query}.*`;
  }

  const result = await session.executeRead((tx) => tx.run(query, queryParams));

  const items = result.records.map((record) => record.get("result"));
  const totalCount = result.records[0]?.get("totalCount")?.toNumber() || 0;
  const hasMore = items.length + (params.offset ?? 0) < totalCount;

  return { items, totalCount, hasMore };
}
