"use client";

import React, { useState, useEffect } from "react";
import { useAdminAllRaffles, useAdminDeleteRaffle } from "../../../hooks/useRaffleHooks";
import { raffleService } from "../../../services/raffle.service";
import { toast } from "sonner";
import { format } from "date-fns";
import ManualWinnerSelectModal from "../shared/ManualWinnerSelectModal";
import ConfirmDeleteRaffleModal, { RaffleDeleteTarget } from "../shared/ConfirmDeleteRaffleModal";
import ViewSoldTicketsModal from "../shared/ViewSoldTicketsModal";
import { Pagination } from "../../ui/Pagination";

export default function AdminCompetitionsTable() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCompForWinner, setSelectedCompForWinner] = useState<any | null>(null);
  const [selectedCompForDelete, setSelectedCompForDelete] = useState<RaffleDeleteTarget | null>(null);
  const [selectedCompForTickets, setSelectedCompForTickets] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportingRaffleId, setExportingRaffleId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading } = useAdminAllRaffles({
    page,
    limit: 20,
    status: activeFilter,
    search: debouncedSearch
  });

  const deleteMutation = useAdminDeleteRaffle();
  const raffles = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || (meta as any)?.lastPage || 1;
  const totalItems = meta?.total || 0;

  const handleConfirmDelete = async () => {
    if (!selectedCompForDelete) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(selectedCompForDelete.id);
      toast.success("Competition deleted successfully");
      setSelectedCompForDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete competition");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportRaffleTicketsCSV = async (comp: any) => {
    if ((comp.ticketsSold || 0) === 0) {
      toast.info(`No tickets have been purchased for "${comp.title}" yet.`);
      return;
    }

    setExportingRaffleId(comp.id);
    try {
      const tickets = await raffleService.getSoldTickets(comp.id);
      
      if (!tickets || tickets.length === 0) {
        toast.info(`No ticket records found for "${comp.title}".`);
        return;
      }

      // Standard Tabular CSV Column Headers (Grid starting at Line 1 for 100% Excel column alignment)
      const headers = [
        "Ticket Number",
        "Competition Title",
        "Category",
        "Buyer / Client Name",
        "Buyer Email",
        "Buyer Phone",
        "Buyer Location",
        "Ticket Price (£)",
        "Win Status",
        "Transaction ID",
        "Gateway Transaction ID",
        "Payment Gateway",
        "Payment Status",
        "Purchase Date & Time"
      ];

      // Standard Tabular Data Rows
      const rows = tickets.map((t: any) => {
        const ticketNum = `#${t.ticketNumber}`;
        const raffleTitle = t.raffleTitle || comp.title || "N/A";
        const category = t.raffleCategory || comp.category || "N/A";
        const buyerName = t.buyerName || t.userName || "N/A";
        const buyerEmail = t.userEmail || "N/A";
        const phone = t.userPhone || "N/A";
        const location = t.userLocation || "N/A";
        const price = Number(t.pricePerTicket || comp.pricePerTicket || 0).toFixed(2);
        const winStatus = t.winStatus || "Regular Entry";
        const txId = t.transactionId || "N/A";
        const gatewayTxId = t.gatewayTransactionId || "N/A";
        const gateway = t.paymentGateway || "N/A";
        const payStatus = t.paymentStatus || "COMPLETED";
        const purchaseDate = t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy HH:mm:ss") : "N/A";

        return [
          ticketNum,
          raffleTitle,
          category,
          buyerName,
          buyerEmail,
          phone,
          location,
          price,
          winStatus,
          txId,
          gatewayTxId,
          gateway,
          payStatus,
          purchaseDate
        ];
      });

      // Construct pure CSV string starting directly with table headers
      const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      // Download file with UTF-8 Byte Order Mark (\uFEFF) for Excel unicode compatibility
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const safeTitle = String(comp.title).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
      link.setAttribute("download", `tickets_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${tickets.length} tickets for "${comp.title}" successfully!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export ticket details CSV");
    } finally {
      setExportingRaffleId(null);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-3 py-1 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Live</span>;
      case "PENDING_APPROVAL":
        return <span className="px-3 py-1 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[#D97706] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Pending</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Rejected</span>;
      case "ENDED":
        return <span className="px-3 py-1 rounded-full border border-[#DDD6FE] bg-[#F3E8FF] text-[#7C3AED] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Ended</span>;
      case "DRAFT":
        return <span className="px-3 py-1 rounded-full border border-border bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
        
        {/* Left: Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar lg:border-r lg:border-divider lg:pr-4 lg:mr-2">
          {["All", "Live", "Pending", "Ended", "Rejected", "Draft"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === filter 
                  ? 'bg-primary text-white shadow-xs border border-primary' 
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right: Search Input */}
        <div className="flex items-center h-10 w-full lg:w-[360px] bg-elevated border border-border-medium rounded-xl px-3 focus-within:border-primary transition-all">
          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by title, host name, or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-text-primary text-xs placeholder:text-text-muted w-full ml-2 font-sans font-semibold"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden overflow-x-auto shadow-card">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-elevated">
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[25%]">TITLE / HOST</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%]">CATEGORY</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center">PRICE/TICKET</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">TICKETS SOLD</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">STATUS</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[13%] text-center">CREATED</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-divider">
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2">
                      <div className="w-3/4 h-3.5 bg-elevated rounded animate-pulse"></div>
                      <div className="w-1/2 h-3 bg-elevated rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-6"><div className="w-16 h-3.5 bg-elevated rounded animate-pulse"></div></td>
                  <td className="py-4 px-6 text-center"><div className="w-12 h-3.5 bg-elevated rounded animate-pulse mx-auto"></div></td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-2 w-full max-w-[180px]">
                      <div className="w-10 h-3 bg-elevated rounded animate-pulse"></div>
                      <div className="w-full h-1 bg-elevated rounded-full animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center"><div className="w-14 h-5 bg-elevated rounded-full animate-pulse mx-auto"></div></td>
                  <td className="py-4 px-6 text-center"><div className="w-20 h-3.5 bg-elevated rounded animate-pulse mx-auto"></div></td>
                  <td className="py-4 px-6 text-right"><div className="w-16 h-5 bg-elevated rounded animate-pulse ml-auto"></div></td>
                </tr>
              ))
            )}
            
            {!isLoading && raffles.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 px-6 text-center text-text-muted font-sans text-xs">
                  No competitions found matching your search.
                </td>
              </tr>
            )}

            {!isLoading && raffles.map((comp: any, i: number) => {
              const progress = comp.totalTickets > 0 ? Math.min(Math.round((comp.ticketsSold / comp.totalTickets) * 100), 100) : 0;
              const hostName = comp.host?.user?.firstName ? `${comp.host.user.firstName} ${comp.host.user.lastName || ''}` : 'Unknown Host';
              const hostEmail = comp.host?.user?.email || '';

              return (
                <tr key={comp.id} className={`${i !== raffles.length - 1 ? 'border-b border-divider' : ''} hover:bg-elevated/40 transition-colors`}>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-heading font-bold text-xs text-text-primary truncate block max-w-[280px]">{comp.title}</span>
                      <span className="font-sans font-medium text-[11px] text-text-muted truncate block max-w-[280px]">{hostName} ({hostEmail})</span>
                      {comp.mainPrizeValue && (
                        <span className="font-sans font-semibold text-[10px] text-emerald-700">
                          Main Prize: £{Number(comp.mainPrizeValue).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-sans font-semibold text-xs text-text-muted">{comp.category || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-heading font-black text-xs text-text-primary">£{Number(comp.pricePerTicket).toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-heading font-bold text-xs text-text-primary">{comp.ticketsSold}/{comp.totalTickets}</span>
                        <button
                          onClick={() => setSelectedCompForTickets(comp)}
                          className="text-[11px] font-sans font-bold text-text-brand hover:underline cursor-pointer flex items-center gap-0.5"
                          title="View Ticket Numbers & Buyer Details"
                        >
                          <span>🎟️</span>
                          <span>View</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1 bg-elevated rounded-full overflow-hidden border border-border-medium">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="font-sans font-bold text-[10px] text-text-muted shrink-0 w-[24px] text-right">{progress}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusPill(comp.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-sans font-semibold text-xs text-text-muted">
                      {comp.createdAt ? format(new Date(comp.createdAt), 'dd MMM yyyy') : 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      {(() => {
                        const hasWinner = Boolean(
                          comp.winners?.some((w: any) => w.winType === 'MAIN_DRAW')
                        );
                        const isSoldOut = (comp.ticketsSold || 0) >= (comp.totalTickets || 1);
                        const isExpired = comp.endDate ? new Date(comp.endDate) <= new Date() : false;
                        const canDraw = !hasWinner && (isSoldOut || isExpired);

                        if (hasWinner) {
                          return (
                            <span className="px-2.5 py-1 rounded-lg border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs">
                              <span>✓</span> Winner Selected
                            </span>
                          );
                        }

                        if (canDraw) {
                          return (
                            <button
                              onClick={() => setSelectedCompForWinner(comp)}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-98"
                            >
                              <span>🏆</span>
                              <span>Select Winner</span>
                            </button>
                          );
                        }

                        return (
                          <span className="px-2.5 py-1 rounded-lg border border-border bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider shrink-0" title="Available when sold out or expired">
                            Live Draw
                          </span>
                        );
                      })()}
                      {/* View Tickets Modal Action */}
                      <button 
                        onClick={() => setSelectedCompForTickets(comp)}
                        className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1 rounded-md hover:bg-elevated" 
                        title="View Ticket Numbers & Buyer Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 7.5A2.25 2.25 0 0 1 5.25 5h13.5A2.25 2.25 0 0 1 21 7.5v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 16.5v-9z" />
                        </svg>
                      </button>

                      {/* Export Tickets CSV Action */}
                      <button 
                        onClick={() => handleExportRaffleTicketsCSV(comp)}
                        disabled={exportingRaffleId === comp.id}
                        className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer p-1 rounded-md hover:bg-elevated" 
                        title={comp.ticketsSold > 0 ? "Export Competition Ticket Sales CSV" : "No tickets sold yet"}
                      >
                        {exportingRaffleId === comp.id ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        )}
                      </button>

                      {/* Delete Action */}
                      <button 
                        onClick={() => setSelectedCompForDelete(comp)}
                        disabled={deleteMutation.isPending || isDeleting}
                        className="text-[#DC2626] hover:text-[#b91c1c] transition-colors disabled:opacity-50 cursor-pointer p-1 rounded-md hover:bg-elevated" 
                        title="Delete Competition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && raffles.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-card border border-border shadow-card">
          <div className="font-sans text-xs text-text-muted">
            Showing <span className="text-text-primary font-bold">{raffles.length}</span> of{" "}
            <span className="text-text-primary font-bold">{totalItems}</span> competitions
            {totalPages > 1 && (
              <span> (Page <span className="text-text-brand font-bold">{page}</span> of {totalPages})</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="[&>div]:mt-0">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}
        </div>
      )}

      {selectedCompForWinner && (
        <ManualWinnerSelectModal
          isOpen={!!selectedCompForWinner}
          onClose={() => setSelectedCompForWinner(null)}
          raffle={selectedCompForWinner}
          isAdmin={true}
        />
      )}

      {selectedCompForDelete && (
        <ConfirmDeleteRaffleModal
          isOpen={!!selectedCompForDelete}
          onClose={() => setSelectedCompForDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          raffle={selectedCompForDelete}
        />
      )}

      {selectedCompForTickets && (
        <ViewSoldTicketsModal
          isOpen={Boolean(selectedCompForTickets)}
          onClose={() => setSelectedCompForTickets(null)}
          raffle={selectedCompForTickets}
        />
      )}
    </div>
  );
}
