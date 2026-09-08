import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Rocket,
  Phone,
  MapPin,
  Calendar,
  Trash2,
  Edit3,
  User,
  Loader2,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface ViewOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (order: Order, newStatus: OrderStatus) => void;
  onSendToSteadfast: (order: Order) => void;
  onDeleteOrder?: (order: Order) => void;
  onUpdateCustomerDetails?: (
    order: Order,
    details: { customerName: string; customerPhone: string; customerAddress: string }
  ) => Promise<boolean> | void;
}

export const ViewOrderModal: React.FC<ViewOrderModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onSendToSteadfast,
  onDeleteOrder,
  onUpdateCustomerDetails,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Customer Editing State
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [name, setName] = useState(order?.customerName || '');
  const [phone, setPhone] = useState(order?.customerPhone || '');
  const [address, setAddress] = useState(order?.customerAddress || '');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  useEffect(() => {
    if (order) {
      setName(order.customerName || '');
      setPhone(order.customerPhone || '');
      setAddress(order.customerAddress || '');
      setIsEditingCustomer(false);
    }
  }, [order?.id, order?.customerName, order?.customerPhone, order?.customerAddress]);

  if (!order) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    if (onDeleteOrder) {
      onDeleteOrder(order);
      onClose();
    }
  };

  const handleCancelCustomerEdit = () => {
    setName(order.customerName || '');
    setPhone(order.customerPhone || '');
    setAddress(order.customerAddress || '');
    setIsEditingCustomer(false);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('গ্রাহকের নাম লিখুন');
      return;
    }
    if (!phone.trim()) {
      alert('ফোন নম্বর লিখুন');
      return;
    }

    setIsSavingCustomer(true);
    try {
      if (onUpdateCustomerDetails) {
        await onUpdateCustomerDetails(order, {
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim(),
        });
      }
      setIsEditingCustomer(false);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#121520] border border-[#22293d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1c2232] flex items-center justify-between bg-[#0e111a]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <h3 className="text-sm sm:text-base font-bold text-white font-mono">
              ইনভয়েস {order.id}
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-pink-500/15 text-pink-400 border border-pink-500/30">
              {order.source || 'Website'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="প্রিন্ট ইনভয়েস"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2232] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2232] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Customer Card: View & Edit Customer Name, Phone, Address */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#161a26] border border-[#232b3e] space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#202738]/60">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pink-400" />
                গ্রাহকের তথ্য
              </span>
              {!isEditingCustomer ? (
                <button
                  type="button"
                  onClick={() => setIsEditingCustomer(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs font-semibold border border-pink-500/30 transition-all cursor-pointer"
                  title="নাম, ফোন বা ঠিকানা এডিট করুন"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>এডিট করুন</span>
                </button>
              ) : (
                <span className="text-[11px] text-pink-400 font-medium">তথ্য সংশোধন মুড</span>
              )}
            </div>

            {isEditingCustomer ? (
              /* Customer Edit Form */
              <form onSubmit={handleSaveCustomer} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    গ্রাহকের নাম (Column F):
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="গ্রাহকের নাম লিখুন"
                      className="w-full bg-[#0d1017] border border-[#263147] focus:border-pink-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    মোবাইল নম্বর (Column C):
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-[#0d1017] border border-[#263147] focus:border-pink-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none font-mono transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    ঠিকানা (Column B):
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                      className="w-full bg-[#0d1017] border border-[#263147] focus:border-pink-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSavingCustomer}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-900/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCustomer ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingCustomer ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCustomerEdit}
                    disabled={isSavingCustomer}
                    className="py-1.5 px-3 rounded-lg bg-[#1e2536] hover:bg-[#28324a] text-gray-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            ) : (
              /* Normal Customer View */
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-gray-100 text-sm">{order.customerName || 'গ্রাহকের নাম নেই'}</h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>{order.customerAddress || 'ঢাকা'}</span>
                  </p>
                </div>

                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center gap-1.5 text-xs text-pink-400 hover:underline font-mono bg-pink-500/10 px-2.5 py-1.5 rounded-lg border border-pink-500/20 shrink-0 active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{order.customerPhone || 'ফোন নম্বর নেই'}</span>
                </a>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#202738] text-[11px] text-gray-400">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-gray-500" />
                তারিখ: {order.date || '08/09/26'}
              </span>
              {order.rowIndex && (
                <span className="text-gray-500 font-mono">
                  গুগল শিট সারি: #{order.rowIndex}
                </span>
              )}
            </div>
          </div>

          {/* Product & Quantity (Column N) & Pricing Table */}
          <div className="border border-[#202738] rounded-xl overflow-hidden">
            <div className="bg-[#0e111a] p-3 text-xs font-semibold text-gray-400 flex justify-between border-b border-[#202738]">
              <span>পণ্য ও ভ্যারিয়েন্ট বিবরণ</span>
              <span>মোট (Col D)</span>
            </div>
            <div className="p-3.5 space-y-2.5 bg-[#141824]">
              <div className="flex items-start justify-between text-xs gap-3">
                <div>
                  <p className="font-bold text-gray-100 text-sm">{order.product || 'Standard Product'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40 font-medium">
                      ভ্যারিয়েন্ট (Col H): {order.variant || 'No Sellect'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40 font-medium">
                      সোর্স (Col I): {order.source || 'Website'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-pink-400 text-base">
                    ৳{order.total || order.amount || 599}
                  </p>
                  <span className="text-[10px] text-gray-500">ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>

              {/* Quantity Highlight (Column N) */}
              <div className="pt-2 border-t border-[#1f2537] flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">অর্ডার পরিমাণ (Column N):</span>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-md bg-[#1f293d] text-emerald-300 border border-[#2b3a55]">
                  {order.quantity || 1} টি
                </span>
              </div>
            </div>
          </div>

          {/* Steadfast Courier Tracking Status */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Rocket className="w-4 h-4 text-pink-400" />
                Steadfast কুরিয়ার ট্র্যাকিং
              </span>
              <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                {order.courierStatus || 'Pending'}
              </span>
            </div>

            {order.trackingCode ? (
              <div className="flex items-center justify-between bg-[#111420] p-2.5 rounded-lg border border-purple-800/30">
                <span className="text-xs font-mono text-gray-200">
                  ট্র্যাকিং কোড: <strong className="text-pink-400">{order.trackingCode}</strong>
                </span>
                <button
                  onClick={() => handleCopy(order.trackingCode!)}
                  className="p-1 text-gray-400 hover:text-white"
                  title="কপি করুন"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">কুরিয়ারে এখনো পাঠানো হয়নি</p>
                <button
                  onClick={() => onSendToSteadfast(order)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  স্টেডফাস্টে পাঠান
                </button>
              </div>
            )}
          </div>

          {/* Status Changer */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              অর্ডার স্ট্যাটাস আপডেট করুন
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['Delivered', 'Processing', 'Pending', 'Hold', 'Cancelled'] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(order, st)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    order.status.toLowerCase() === st.toLowerCase()
                      ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/30'
                      : 'bg-[#181c28] text-gray-400 border-[#262f44] hover:bg-[#202738] hover:text-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="p-3 bg-[#161a26] border border-[#232b3e] rounded-xl text-xs text-gray-300">
              <span className="text-gray-500 font-semibold block mb-1">নোট:</span>
              {order.notes}
            </div>
          )}
        </div>

        {/* Footer with Delete and Close */}
        <div className="p-3.5 sm:p-4 border-t border-[#1c2232] bg-[#0e111a] flex items-center justify-between gap-3">
          {onDeleteOrder && (
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-semibold hidden sm:inline">নিশ্চিত?</span>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
                  >
                    হ্যাঁ, ডিলিট করুন
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1d2334] text-gray-300 text-xs font-medium"
                  >
                    না
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ডিলিট</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-[#1d2334] text-gray-200 text-xs font-semibold hover:bg-[#283149] transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
