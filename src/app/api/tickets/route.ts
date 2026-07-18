import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { TicketPurchaseSchema } from '@/lib/validators';
import { TicketRepository } from '@/repositories/ticket.repository';
import type { Ticket } from '@/types/ticket.types';
import type { PaginatedResult } from '@/types/api.types';

/**
 * GET /api/tickets
 * Authenticated user. Lists the tickets owned by the requesting account.
 */
export const GET = withApiHandler(
  async (req, ctx) => {
    const params = req.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? '20') || 20));

    const repo = new TicketRepository();
    const all = await repo.findTicketsByUser(ctx.session!.uid);
    const items = all.slice((page - 1) * pageSize, page * pageSize);

    const body: PaginatedResult<Ticket> = {
      items,
      total: all.length,
      page,
      pageSize,
    };
    return NextResponse.json(body);
  },
  { requireRole: 'user' }
);

/**
 * POST /api/tickets
 * Authenticated user. Purchases a seat and persists the resulting ticket.
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { seatId, pricePaid } = ctx.body;
    const repo = new TicketRepository();

    const ticketData: Omit<Ticket, 'id'> = {
      seatId,
      userId: ctx.session!.uid,
      pricePaid,
      purchasedAt: new Date().toISOString(),
      fraudStatus: 'clear',
    };
    const id = await repo.create(ticketData);

    const created: Ticket = { id, ...ticketData };
    return NextResponse.json(created, { status: 201 });
  },
  { schema: TicketPurchaseSchema, requireRole: 'user' }
);
