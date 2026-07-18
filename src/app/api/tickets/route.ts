import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { TicketPurchaseSchema } from '@/lib/validators';
import { TicketRepository } from '@/repositories/ticket.repository';
import { parsePagination, paginate } from '@/utils/pagination';
import type { Ticket } from '@/types/ticket.types';

/**
 * GET /api/tickets
 * Authenticated user. Lists the tickets owned by the requesting account.
 */
export const GET = withApiHandler(
  async (req, ctx) => {
    const { page, pageSize } = parsePagination(req.nextUrl.searchParams);

    const repo = new TicketRepository();
    const all = await repo.findTicketsByUser(ctx.session!.uid);
    const body = paginate<Ticket>(all, page, pageSize);
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
