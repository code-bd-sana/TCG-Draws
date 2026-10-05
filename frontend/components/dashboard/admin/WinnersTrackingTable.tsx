'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import { Winner, winnerService } from '../../../services/winner.service';
import VerifyWinnerModal from './VerifyWinnerModal';

export default function WinnersTrackingTable() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [winTypeFilter, setWinTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);

  const queryClient = useQueryClient();

  const filters = ['All', 'Pending Verification', 'Verified & Published', 'Prize Delivered'];
  const winTypeFilters = ['All', 'Main Draw', 'Instant Win'];

  const getVerificationQuery = (filter: string) => {
    switch (filter) {
      case 'Pending Verification':
        return 'PENDING';
      case 'Verified & Published':
        return 'VERIFIED';
      default:
        return 'All';
    }
  };

  const getDeliveryQuery = (filter: string) => {
    if (filter === 'Prize Delivered') return 'DELIVERED';
    return 'All';
  };

  const getWinTypeQuery = (filter: string) => {
    switch (filter) {
      case 'Main Draw':
        return 'MAIN_DRAW';
      case 'Instant Win':
        return 'INSTANT_WIN';
      default:
        return 'All';
    }
  };

  const { data: winnersResponse, isLoading } = useQuery({
    queryKey: ['adminWinners', activeFilter, winTypeFilter],
    queryFn: () =>
      winnerService.getAdminWinners({
        verificationStatus: getVerificationQuery(activeFilter),
        status: getDeliveryQuery(activeFilter),
        winType: getWinTypeQuery(winTypeFilter),
      }),
  });

  const winners = winnersResponse?.data || [];

  const handleVerify = (winner: Winner) => {
    setSelectedWinner(winner);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (winners.length === 0) return;

    const headers = [
      "ID",
      "Winner Name",
      "User Email",
      "Competition Won",
      "Win Type",
      "Prize Name",
      "Draw Date",
      "Verification Status",
      "Delivery Status"
    ];

    const rows = winners.map((winner: Winner) => {
      const name = `${winner.user?.firstName || ''} ${winner.user?.lastName || ''}`.trim() || 'Unknown';
      const email = winner.user?.email || 'N/A';
      const competition = winner.raffle?.title || 'Unknown Raffle';
      const winType = winner.winType === 'INSTANT_WIN' ? 'Instant Win' : 'Main Draw';
      const prize = winner.prizeName || 'N/A';
      const drawDate = winner.createdAt ? format(new Date(winner.createdAt), 'dd MMM yyyy HH:mm') : 'N/A';
      const verificationStatus = winner.verificationStatus || 'N/A';
      const deliveryStatus = winner.deliveryStatus || 'N/A';

      return [
        winner.id,
        name,
        email,
        competition,
        winType,
        prize,
        drawDate,
        verificationStatus,
        deliveryStatus
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const filterTag = activeFilter.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const winTypeTag = winTypeFilter.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute("download", `winners_export_${filterTag}_${winTypeTag}_${new Date().toISOString().slice(0, 10)}.csv`);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ensure this handles the verification correctly locally if we are mocking the modal API call inside it,
  // or we can refresh the table on modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['adminWinners'] });
  };

  const getStatusStyle = (winner: Winner) => {
    if (winner.deliveryStatus === 'DELIVERED')
      return 'border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-bold shadow-xs';
    if (winner.verificationStatus === 'VERIFIED')
      return 'border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-bold shadow-xs';
    if (winner.verificationStatus === 'PENDING')
      return 'border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] font-bold shadow-xs';
    return 'border-border bg-elevated text-text-muted font-bold shadow-xs';
  };

  const getDisplayStatus = (winner: Winner) => {
    if (winner.deliveryStatus === 'DELIVERED') return 'Prize Delivered';
    if (winner.verificationStatus === 'VERIFIED') return 'Verified';
    if (winner.verificationStatus === 'PENDING') return 'Pending Verification';
    return 'Unknown';
  };

  return (
    <div className='flex flex-col gap-6 w-full mt-2'>
      {/* Filters Container */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
        {/* Status Filters */}
        <div className='flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar'>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-primary text-white shadow-xs border border-primary'
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Win Type Filters & Export CSV */}
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar'>
            {winTypeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setWinTypeFilter(filter)}
                className={`px-4 py-2 rounded-full font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  winTypeFilter === filter
                    ? 'bg-primary text-white shadow-xs border border-primary'
                    : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={winners.length === 0}
            className="h-9 px-4 bg-surface border border-border hover:bg-elevated rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
            title="Export filtered winners to CSV"
          >
            <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className='w-full bg-surface border border-border rounded-card overflow-hidden overflow-x-auto shadow-card'>
        <table className='w-full min-w-[1050px] text-left border-collapse'>
          <thead>
            <tr className='border-b border-divider bg-elevated'>
              <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]'>
                WINNER NAME
              </th>
              <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]'>
                COMPETITION WON
              </th>
              <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center'>
                WIN TYPE
              </th>
              <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center'>
                DRAW DATE
              </th>
              <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center'>
                PRIZE TITLE
              </th>
              <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[15%] text-center'>
                CLAIM STATUS
              </th>
              <th className='py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[13%] text-right'>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className='py-8 text-center text-text-muted font-sans text-xs font-bold'>
                  Loading winners...
                </td>
              </tr>
            ) : winners.length === 0 ? (
              <tr>
                <td colSpan={7} className='py-8 text-center text-text-muted font-sans text-xs font-bold'>
                  No competition winners found.
                </td>
              </tr>
            ) : (
              winners.map((winner, i) => {
                const name =
                  `${winner.user?.firstName || ''} ${winner.user?.lastName || ''}`.trim() ||
                  'Unknown';
                const initials = name.substring(0, 2).toUpperCase();

                return (
                  <tr
                    key={winner.id}
                    className={`${i !== winners.length - 1 ? 'border-b border-divider' : ''} hover:bg-elevated/40 transition-colors`}
                  >
                    <td className='py-4 px-6'>
                      <div className='flex items-center gap-3'>
                        <div className='w-7 h-7 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs'>
                          {winner.user?.avatarUrl ? (
                            <img
                              src={winner.user.avatarUrl}
                              alt='Winner'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='font-sans font-bold text-[10px] text-text-brand'>
                              {initials}
                            </span>
                          )}
                        </div>
                        <span className='font-heading font-bold text-xs text-text-primary'>
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-6'>
                      <span className='font-sans font-semibold text-xs text-text-muted truncate block w-[180px]'>
                        {winner.raffle?.title || 'Unknown Raffle'}
                      </span>
                    </td>
                    <td className='py-4 px-6 text-center'>
                      {winner.winType === 'INSTANT_WIN' ? (
                        <span className='font-sans font-bold text-xs text-[#15803D]'>
                          Instant Win
                        </span>
                      ) : (
                        <span className='font-sans font-bold text-xs text-[#D97706]'>
                          Main Draw
                        </span>
                      )}
                    </td>
                    <td className='py-4 px-6 text-center'>
                      <span className='font-sans font-semibold text-xs text-text-muted'>
                        {format(new Date(winner.createdAt), 'dd MMM yyyy')}
                      </span>
                    </td>
                    <td className='py-4 px-6 text-center'>
                      <span className='font-heading font-bold text-xs text-text-primary'>
                        {winner.prizeName}
                      </span>
                    </td>
                    <td className='py-4 px-6 text-center'>
                      <span
                        className={`px-3 py-1 rounded-full font-sans text-[10px] uppercase tracking-wider whitespace-nowrap ${getStatusStyle(winner)}`}
                      >
                        {getDisplayStatus(winner)}
                      </span>
                    </td>
                    <td className='py-4 px-6'>
                      <div className='flex items-center justify-end gap-3'>
                        {winner.verificationStatus === 'PENDING' && (
                          <button
                            onClick={() => handleVerify(winner)}
                            className='h-8 px-5 rounded-lg bg-primary hover:bg-primary/90 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-98'
                          >
                            Verify Claim
                          </button>
                        )}
                        {winner.verificationStatus === 'VERIFIED' &&
                          winner.deliveryStatus === 'PENDING' && (
                            <button className='h-8 px-4 rounded-lg bg-elevated border border-border text-text-muted font-heading font-bold text-[11px] uppercase tracking-wider cursor-not-allowed opacity-60'>
                              Awaiting Delivery
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <VerifyWinnerModal isOpen={isModalOpen} onClose={handleModalClose} winner={selectedWinner} />
    </div>
  );
}
