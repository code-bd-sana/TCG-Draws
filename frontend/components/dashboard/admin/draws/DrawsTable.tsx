'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Raffle } from '../../../../services/raffle.service';
import ManualWinnerSelectModal from '../../shared/ManualWinnerSelectModal';

export default function DrawsTable({
  draws,
  onSelectDraw,
}: {
  draws: Raffle[];
  onSelectDraw: (draw: Raffle) => void;
}) {
  const getStatusPill = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className='px-3 py-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs'>
            Pending Approval
          </span>
        );
      case 'DRAFT':
        return (
          <span className='px-3 py-1 rounded-full border border-border bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs'>
            Draft
          </span>
        );
      case 'ENDED':
        return (
          <span className='px-3 py-1 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs'>
            Completed
          </span>
        );
      case 'ACTIVE':
        return (
          <span className='px-3 py-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs'>
            In Progress
          </span>
        );
      case 'CANCELLED':
        return (
          <span className='px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs'>
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getDrawType = (draw: Raffle) => {
    if (!draw.isAutoDraw) return 'Manual (Host)';
    if (draw.isAutoDraw && draw.autoDrawSoldOut) return 'Auto (Sold Out)';
    return 'Auto (Date)';
  };

  const getTypeStyle = (type: string) => {
    if (type.includes('Auto')) return 'text-[#15803D] font-bold';
    if (type.includes('Manual')) return 'text-[#D97706] font-bold';
    return 'text-text-primary font-bold';
  };

  const [selectedDrawForWinner, setSelectedDrawForWinner] = useState<Raffle | null>(null);

  return (
    <div className='w-full bg-surface border border-border rounded-card overflow-hidden overflow-x-auto shadow-card'>
      <table className='w-full min-w-[900px] text-left border-collapse'>
        <thead>
          <tr className='border-b border-divider bg-elevated'>
            <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[20%]'>
              COMPETITION NAME
            </th>
            <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[20%]'>
              HOST OPERATOR
            </th>
            <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center'>
              DRAW ENGINE
            </th>
            <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center'>
              END DATE
            </th>
            <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center'>
              TOTAL TICKETS
            </th>
            <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center'>
              STATUS
            </th>
            <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-right'>
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {draws.map((draw, i) => {
            const hostName = draw.host?.businessName || 'Unknown Host';
            const hostInitials = hostName.substring(0, 2).toUpperCase();
            const drawType = getDrawType(draw);

            return (
              <tr
                key={draw.id}
                className={`${i !== draws.length - 1 ? 'border-b border-divider' : ''} hover:bg-elevated/40 transition-colors`}
              >
                <td className='py-4 px-6'>
                  <span className='font-heading font-bold text-xs text-text-primary'>
                    {draw.title}
                  </span>
                </td>
                <td className='py-4 px-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-7 h-7 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs'>
                      {draw.host?.user?.avatarUrl ? (
                        <img
                          src={draw.host.user.avatarUrl}
                          alt='Host'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <span className='font-sans font-bold text-[10px] text-text-brand'>
                          {hostInitials}
                        </span>
                      )}
                    </div>
                    <span className='font-sans font-semibold text-xs text-text-muted'>{hostName}</span>
                  </div>
                </td>
                <td className='py-4 px-6 text-center'>
                  <span className={`font-sans text-xs ${getTypeStyle(drawType)}`}>
                    {drawType}
                  </span>
                </td>
                <td className='py-4 px-6 text-center'>
                  <span className={`font-sans font-semibold text-xs text-text-muted`}>
                    {draw.endDate ? format(new Date(draw.endDate), 'dd MMM yyyy HH:mm') : 'N/A'}
                  </span>
                </td>
                <td className='py-4 px-6 text-center'>
                  <span className='font-heading font-bold text-xs text-text-primary'>
                    {draw.totalTickets}
                  </span>
                </td>
                <td className='py-4 px-6 text-center flex justify-center'>
                  {getStatusPill(draw.status)}
                </td>
                <td className='py-4 px-6'>
                  <div className='flex items-center justify-end gap-3'>
                    <button
                      onClick={() => onSelectDraw(draw)}
                      className='px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer'
                    >
                      Details
                    </button>
                    {(() => {
                      const hasWinner = Boolean(
                        (draw as any).winners?.some((w: any) => w.winType === 'MAIN_DRAW')
                      );
                      const isSoldOut = (draw.ticketsSold || 0) >= (draw.totalTickets || 1);
                      const isExpired = draw.endDate ? new Date(draw.endDate) <= new Date() : false;
                      const canDraw = !hasWinner && (isSoldOut || isExpired);

                      if (hasWinner) {
                        return (
                          <span className='px-2.5 py-1 rounded-lg border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs'>
                            <span>✓</span> Winner Selected
                          </span>
                        );
                      }

                      if (canDraw) {
                        return (
                          <button
                            onClick={() => setSelectedDrawForWinner(draw)}
                            className='px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-98'
                          >
                            <span>🏆</span>
                            <span>Select Winner</span>
                          </button>
                        );
                      }

                      return (
                        <span className='px-2.5 py-1 rounded-lg border border-border bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider shrink-0' title="Available when sold out or expired">
                          Live Draw
                        </span>
                      );
                    })()}
                  </div>
                </td>
              </tr>
            );
          })}
          {draws.length === 0 && (
            <tr>
              <td colSpan={7} className='py-8 text-center text-text-muted font-sans text-xs font-bold'>
                No draws found for this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedDrawForWinner && (
        <ManualWinnerSelectModal
          isOpen={!!selectedDrawForWinner}
          onClose={() => setSelectedDrawForWinner(null)}
          raffle={selectedDrawForWinner}
          isAdmin={true}
          onSuccess={() => {
            // Optional callback
          }}
        />
      )}
    </div>
  );
}
