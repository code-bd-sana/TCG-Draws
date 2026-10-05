"use client";

import React, { useState } from "react";
import ProcessRefundModal, { OrderData } from "./ProcessRefundModal";
import OrderDetailsModal from "./OrderDetailsModal";
import { useAdminOrders } from "../../../hooks/useAdminHooks";

export default function AdminOrdersTable() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<OrderData | null>(null);

  const { data: response, isLoading } = useAdminOrders({ page, limit: 10 });

  const handleRefund = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Paid":
        return <span className="px-3 py-1 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">{status}</span>;
      case "Refunded":
        return <span className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">{status}</span>;
      case "Failed":
        return <span className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">{status}</span>;
      default:
        return null;
    }
  };

  const orders = response?.orders || [];
  const totalPages = response?.totalPages || 1;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Table Container */}
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden overflow-x-auto shadow-card">
        <table className="w-full min-w-[1050px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-elevated">
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%]">ORDER ID</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">BUYER</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[18%]">COMPETITION</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[8%] text-center">TICKETS</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">AMOUNT</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">PAYMENT</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-center">STATUS</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[12%] text-center">DATE</th>
              <th className="py-3.5 px-6 font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider w-[10%] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-text-muted font-sans text-xs">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-text-muted font-sans text-xs">
                  No ticket orders found.
                </td>
              </tr>
            ) : (
              orders.map((order: OrderData, i: number) => (
                <tr key={order.id} className={`${i !== orders.length - 1 ? 'border-b border-divider' : ''} hover:bg-elevated/40 transition-colors`}>
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-xs text-text-brand">#{order.orderId}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="font-sans font-bold text-[10px] text-text-brand">{order.buyerInitials}</span>
                      </div>
                      <span className="font-heading font-bold text-xs text-text-primary">{order.buyerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-sans font-semibold text-xs text-text-muted truncate block w-[160px]">{order.competition}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-heading font-bold text-xs text-text-primary">{order.tickets}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-heading font-black text-xs text-text-primary">£{order.amount.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-sans font-semibold text-xs text-text-muted">{order.payment}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusPill(order.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-sans font-semibold text-xs text-text-muted">{formatDate(order.date)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1 rounded-md hover:bg-elevated" 
                        title="View Order Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </button>
                      
                      {order.status === "Paid" && (
                        <button 
                          onClick={() => handleRefund(order)}
                          className="btn-glossy-red text-white font-heading font-bold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface border border-border rounded-card px-6 py-4 shadow-card">
          <span className="font-sans text-xs font-bold text-text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-surface border border-border hover:bg-elevated rounded-xl text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-surface border border-border hover:bg-elevated rounded-xl text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProcessRefundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder} 
      />

      <OrderDetailsModal
        isOpen={Boolean(selectedOrderForDetails)}
        onClose={() => setSelectedOrderForDetails(null)}
        order={selectedOrderForDetails}
        onOpenRefund={handleRefund}
      />
    </div>
  );
}
