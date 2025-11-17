/**
 * Database Service
 * Provides connection pool and query helpers for PostgreSQL
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';
import pool from '../config/database';
import { DatabaseError } from '../utils/errors/CustomErrors';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  /**
   * Execute a query
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  async query<T extends QueryResultRow = Record<string, unknown>>(
    query: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    try {
      return await this.pool.query<T>(query, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw new DatabaseError(
        'Database query failed',
        { query: query.substring(0, 100), error: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Execute a query and return the first row
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns First row or null
   */
  async queryOne<T extends QueryResultRow = Record<string, unknown>>(
    query: string,
    params?: unknown[]
  ): Promise<T | null> {
    const result = await this.query<T>(query, params);
    return result.rows[0] || null;
  }

  /**
   * Execute a query and return all rows
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Array of rows
   */
  async queryMany<T extends QueryResultRow = Record<string, unknown>>(
    query: string,
    params?: unknown[]
  ): Promise<T[]> {
    const result = await this.query<T>(query, params);
    return result.rows;
  }

  /**
   * Execute an INSERT query and return the inserted row
   * @param table - Table name
   * @param data - Data to insert
   * @param returning - Columns to return (default: *)
   * @returns Inserted row
   */
  async insert<T extends QueryResultRow = Record<string, unknown>>(
    table: string,
    data: Record<string, unknown>,
    returning: string = '*'
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returning}
    `;

    const result = await this.query<T>(query, values);
    return result.rows[0];
  }

  /**
   * Execute an UPDATE query and return the updated row
   * @param table - Table name
   * @param id - Record ID
   * @param data - Data to update
   * @param returning - Columns to return (default: *)
   * @returns Updated row or null
   */
  async update<T extends QueryResultRow = Record<string, unknown>>(
    table: string,
    id: string,
    data: Record<string, unknown>,
    returning: string = '*'
  ): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1}
      RETURNING ${returning}
    `;

    const result = await this.query<T>(query, [...values, id]);
    return result.rows[0] || null;
  }

  /**
   * Execute a DELETE query
   * @param table - Table name
   * @param id - Record ID
   * @returns True if deleted, false otherwise
   */
  async delete(table: string, id: string): Promise<boolean> {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
    const result = await this.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Check if a record exists
   * @param table - Table name
   * @param conditions - WHERE conditions as key-value pairs
   * @returns True if exists, false otherwise
   */
  async exists(table: string, conditions: Record<string, unknown>): Promise<boolean> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

    const query = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${whereClause}) as exists`;
    const result = await this.queryOne<{ exists: boolean }>(query, values);
    return result?.exists || false;
  }

  /**
   * Get paginated results
   * @param query - Base SQL query (without LIMIT/OFFSET)
   * @param params - Query parameters
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Paginated results with total count
   */
  async paginate<T extends QueryResultRow = Record<string, unknown>>(
    query: string,
    params: unknown[],
    page: number,
    limit: number
  ): Promise<{ data: T[]; total: number }> {
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM (${query}) as count_query`;
    const countResult = await this.queryOne<{ count: string }>(countQuery, params);
    const total = parseInt(countResult?.count || '0', 10);

    // Get paginated data
    const offset = (page - 1) * limit;
    const paginatedQuery = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const data = await this.queryMany<T>(paginatedQuery, [...params, limit, offset]);

    return { data, total };
  }

  /**
   * Execute a transaction
   * @param callback - Transaction callback function
   * @returns Result of the callback
   */
  async transaction<T>(callback: (client: Pool) => Promise<T>): Promise<T> {
    const client = this.pool;

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Test database connection
   * @returns True if connected, false otherwise
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export singleton instance
export default new DatabaseService();
