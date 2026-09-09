import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  ShieldCheck,
  Smartphone,
  AlertTriangle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/FeedbackComponents';
import { Modal } from '../../components/ui/Modal';
import {
  getAllPaymentsAdmin,
  approvePaymentAdmin,
  rejectPaymentAdmin,
  BKASH_RECEIVER_NUMBER,
} from '../../services/paymentService';
import { PaymentRecord, PaymentStatus } from '../../types';

export const AdminPaymentsPage: React.FC = () => {
  const { profile, currentUser } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected payment modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Approval confirmation modal
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('Verified via bKash statement');
  const [isApproving, setIsApproving] = useState(false);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Transaction ID not found in bKash statement.');
  const [isRejecting, setIsRejecting] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await getAllPaymentsAdmin(activeFilter);
      setPayments(data);
    } catch (err) {
      console.error('Failed to load admin payments:', err);
      toastError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [activeFilter]);

  const adminEmail = profile?.email || currentUser?.email || 'imranmahmud1122.test@gmail.com';

  const handleApprove = async () => {
    if (!selectedPayment) return;
    setIsApproving(true);
    try {
      await approvePaymentAdmin(selectedPayment, adminEmail, approvalNote);
      success(`Payment for ${selectedPayment.userName} approved! Plan activated.`);
      setConfirmApproveOpen(false);
      setDetailsModalOpen(false);
      await loadPayments();
    } catch (err: any) {
      toastError(err.message || 'Approval failed.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    if (!rejectionReason.trim()) {
      toastError('Please provide a reason for rejecting the payment.');
      return;
    }
    setIsRejecting(true);
    try {
      await rejectPaymentAdmin(selectedPayment, adminEmail, rejectionReason);
      info(`Payment ${selectedPayment.transactionId} rejected.`);
      setRejectModalOpen(false);
      setDetailsModalOpen(false);
      await loadPayments();
    } catch (err: any) {
      toastError(err.message || 'Rejection failed.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Filter and search
  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.userName?.toLowerCase().includes(q) ||
      p.userEmail?.toLowerCase().includes(q) ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.plan?.toLowerCase().includes(q);
    return matchSearch;
  });

  const pendingCount = payments.filter((p) => p.paymentStatus === 'PENDING').length;
  const approvedCount = payments.filter((p) => p.paymentStatus === 'APPROVED').length;
  const rejectedCount = payments.filter((p) => p.paymentStatus === 'REJECTED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              bKash Payment Verification
            </h1>
            <Badge variant="pink" size="sm">
              Receiver: {BKASH_RECEIVER_NUMBER}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manual verification gateway: Audit Transaction IDs against merchant statements before activating Pro/Business subscriptions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadPayments}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className={`p-5 cursor-pointer transition border-2 ${
            activeFilter === 'PENDING' ? 'border-amber-500 bg-amber-50/20' : 'border-slate-200'
          }`}
          onClick={() => setActiveFilter('PENDING')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2 font-['Space_Grotesk',sans-serif]">
            {pendingCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting Transaction verification</span>
        </Card>

        <Card
          className={`p-5 cursor-pointer transition border-2 ${
            activeFilter === 'APPROVED' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
          }`}
          onClick={() => setActiveFilter('APPROVED')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Approved Payments
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2 font-['Space_Grotesk',sans-serif]">
            {approvedCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active verified subscriptions</span>
        </Card>

        <Card
          className={`p-5 cursor-pointer transition border-2 ${
            activeFilter === 'REJECTED' ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'
          }`}
          onClick={() => setActiveFilter('REJECTED')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Rejected Submissions
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2 font-['Space_Grotesk',sans-serif]">
            {rejectedCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Invalid TrxID or mismatched amounts</span>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL'
                ? 'All Payments'
                : tab === 'PENDING'
                ? `Pending (${pendingCount})`
                : tab === 'APPROVED'
                ? `Approved (${approvedCount})`
                : `Rejected (${rejectedCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search TrxID, user, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Payments Table */}
      <Card className="overflow-hidden border-slate-200">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Loading payments...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No payments found</p>
            <p className="text-xs text-slate-400">
              {searchQuery
                ? 'No transactions matching your search query.'
                : 'No bKash submissions under this status.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">bKash TrxID</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((item) => (
                  <tr key={item.paymentId || item.transactionId} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{item.userName}</div>
                      <div className="text-[11px] text-slate-500">{item.userEmail}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={item.plan === 'BUSINESS' ? 'purple' : 'blue'}
                        size="sm"
                      >
                        {item.plan}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ৳{item.amount?.toLocaleString()} BDT
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {item.transactionId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(item.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.paymentStatus === 'APPROVED' ? (
                        <Badge variant="emerald" size="sm">
                          APPROVED
                        </Badge>
                      ) : item.paymentStatus === 'REJECTED' ? (
                        <Badge variant="rose" size="sm">
                          REJECTED
                        </Badge>
                      ) : (
                        <Badge variant="amber" size="sm" className="animate-pulse">
                          PENDING
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(item);
                            setDetailsModalOpen(true);
                          }}
                          leftIcon={<Eye className="w-3 h-3" />}
                        >
                          View
                        </Button>

                        {item.paymentStatus === 'PENDING' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1"
                              onClick={() => {
                                setSelectedPayment(item);
                                setConfirmApproveOpen(true);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="px-2.5 py-1"
                              onClick={() => {
                                setSelectedPayment(item);
                                setRejectModalOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL 1: Payment Details View */}
      {selectedPayment && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`bKash Payment Details (${selectedPayment.transactionId})`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Header info bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold block">Status</span>
                <div className="mt-1">
                  {selectedPayment.paymentStatus === 'APPROVED' ? (
                    <Badge variant="emerald">APPROVED</Badge>
                  ) : selectedPayment.paymentStatus === 'REJECTED' ? (
                    <Badge variant="rose">REJECTED</Badge>
                  ) : (
                    <Badge variant="amber">PENDING VERIFICATION</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase font-bold block">Requested Plan</span>
                <span className="text-base font-extrabold text-slate-900">{selectedPayment.plan}</span>
              </div>
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">Customer Name</span>
                <strong className="text-slate-900 text-sm">{selectedPayment.userName}</strong>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">Customer Email</span>
                <strong className="text-slate-900 text-sm font-mono">{selectedPayment.userEmail}</strong>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">Payment Amount</span>
                <strong className="text-[#E2136E] text-base font-extrabold">
                  ৳{selectedPayment.amount?.toLocaleString()} BDT
                </strong>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">bKash Receiving Number</span>
                <strong className="text-slate-800 text-sm font-mono">{BKASH_RECEIVER_NUMBER}</strong>
              </div>

              <div className="col-span-2 p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">bKash Transaction ID (TrxID)</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-base font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {selectedPayment.transactionId}
                  </span>
                  <span className="text-xs text-slate-400">
                    Verify this ID against bKash merchant transaction logs
                  </span>
                </div>
              </div>

              <div className="col-span-2 p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">Customer Note</span>
                <span className="text-slate-700 text-xs mt-0.5 block">
                  {selectedPayment.paymentNote || 'None provided'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">Submitted At</span>
                <span className="text-slate-700 text-xs">
                  {new Date(selectedPayment.submittedAt).toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-xs">Reviewed By</span>
                <span className="text-slate-700 text-xs font-mono">
                  {selectedPayment.reviewedBy || 'Not reviewed yet'}
                </span>
              </div>

              {selectedPayment.adminNote && (
                <div className="col-span-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <span className="text-amber-700 font-bold block text-xs">Admin Review Note:</span>
                  <span className="text-xs mt-0.5 block">{selectedPayment.adminNote}</span>
                </div>
              )}
            </div>

            {/* Actions for Pending */}
            {selectedPayment.paymentStatus === 'PENDING' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  variant="danger"
                  onClick={() => setRejectModalOpen(true)}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Reject Payment
                </Button>
                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setConfirmApproveOpen(true)}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Approve Payment
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: Approval Confirmation Dialog */}
      {selectedPayment && (
        <Modal
          isOpen={confirmApproveOpen}
          onClose={() => setConfirmApproveOpen(false)}
          title="Approve Payment Confirmation"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Confirm bKash Transaction Verification</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Are you sure you want to approve this payment? Have you verified TrxID{' '}
                <strong className="font-mono">{selectedPayment.transactionId}</strong> in your bKash
                account statement for <strong>৳{selectedPayment.amount} BDT</strong>?
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                • <strong>Customer:</strong> {selectedPayment.userName} ({selectedPayment.userEmail})
              </p>
              <p>
                • <strong>Action:</strong> User subscription will immediately become{' '}
                <strong className="text-emerald-700">{selectedPayment.plan} (ACTIVE)</strong>.
              </p>
              <p>
                • <strong>AI Credits:</strong>{' '}
                {selectedPayment.plan === 'BUSINESS' ? 1200 : 350} credits will be unlocked.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Note / Audit Remark (Optional)
              </label>
              <input
                type="text"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmApproveOpen(false)}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
                isLoading={isApproving}
              >
                Confirm &amp; Activate Plan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: Rejection Reason Dialog */}
      {selectedPayment && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Payment Submission"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>State Rejection Reason</span>
              </div>
              The customer will be notified with this reason and allowed to submit a corrected
              Transaction ID.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. Transaction ID not found in bKash statement or amount was insufficient."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={isRejecting}
              >
                Reject Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
