'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import HomeWrapper from '@/components/HomeWrapper';
import { FaUser, FaPhoneAlt, FaTicketAlt, FaChair } from 'react-icons/fa';
import { Clapperboard, MonitorDot, CalendarDays, ChevronRight } from 'lucide-react';

/* -------------------- Types -------------------- */
interface Seat {
  _id: string;
  seatNumber: string;
  row: number;
  column: number;
  type?: 'VIP' | 'Normal' | 'Disabled';
}

interface SeatWithBooking extends Seat {
  isBooked: boolean;
  isAvailable: boolean;
  bookingId?: string;
}

interface Room {
  _id: string;
  name: string;
  seats: SeatWithBooking[];
}

interface Movie {
  _id: string;
  title: string;
}

interface TicketPrices {
  VIP: number;
  Normal: number;
}

interface Showtime {
  _id: string;
  movie: Movie;
  room: Room;
  date: string;
  time: string;
  ticketPrices: TicketPrices;
  seats: SeatWithBooking[];
}

/* -------------------- Booking Page -------------------- */
export default function BookingPage() {
  const { id } = useParams();
  const BASE_URL = 'https://abdullah-test.whitescastle.com';

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPrice, setDiscountPrice] = useState<number | null>(null);
  const [discountReference, setDiscountReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'JazzCash/EasyPaisa' | 'Bank'>('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [bankName, setBankName] = useState<'HBL' | 'Allied' | 'UBL' | 'Meezan'>('HBL');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  /* -------------------- Fetch Showtime -------------------- */
  const fetchShowtime = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/showtimes/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch showtime');

      const roomSeats: Seat[] = Array.isArray(data.room.seats) ? data.room.seats : [];

      // Fetch booked seats
      const bookedRes = await fetch(`${BASE_URL}/api/showtimes/${id}/booked-seats`);
      const bookedData = await bookedRes.json();
      if (!bookedRes.ok) throw new Error(bookedData.message || 'Failed to fetch booked seats');

      const bookings: { _id: string; seat: string }[] =
        bookedData.bookings?.map((b: any) => ({ _id: String(b._id), seat: String(b.seat) })) || [];

      const seats: SeatWithBooking[] = roomSeats.map((seat) => {
        const booking = bookings.find((b) => b.seat === seat._id);
        return {
          ...seat,
          isBooked: !!booking,
          isAvailable: !booking && seat.type !== 'Disabled',
          bookingId: booking ? booking._id : undefined,
        };
      });

      setShowtime({
        _id: data._id,
        movie: { _id: data.movie._id, title: data.movie.title },
        room: { ...data.room, seats },
        date: new Date(data.date).toLocaleDateString(),
       time: new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        ticketPrices: data.ticketPrices || { VIP: 700, Normal: 400 },
        seats,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load showtime');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchShowtime();
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, [id]);

  /* -------------------- Seat Selection -------------------- */
  const toggleSeat = (seatNumber: string) => {
    if (!showtime) return;
    const seat = showtime.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) return;

    // Do nothing if seat is disabled or already booked
    if (seat.type === 'Disabled' || seat.isBooked) {
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };


  /* -------------------- Handle Booking -------------------- */
  const handleBooking = async () => {
    if (!customerName || !customerPhone || selectedSeats.length === 0) {
      toast.error('Please fill all details and select seats');
      return;
    }

    if (hasDiscount && discountPrice && !discountReference) {
      toast.error('Discount reference is required');
      return;
    }

    if (paymentMethod !== 'Cash' && !transactionId) {
      toast.error('Transaction ID is required');
      return;
    }

    if (paymentMethod === 'Bank' && !bankName.trim()) {
      toast.error('Bank name is required for Bank payments');
      return;
    }

    if (!showtime) return;

    setBookingLoading(true);

    try {
      const ticketPrice = selectedSeats.reduce((sum, seatNum) => {
        const seat = showtime.seats.find((s) => s.seatNumber === seatNum);
        if (!seat) return sum;
        return sum + (seat.type === 'VIP' ? showtime.ticketPrices.VIP : showtime.ticketPrices.Normal);
      }, 0);

      const totalPrice = ticketPrice - (discountPrice || 0);

      const res = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showtimeId: showtime._id,
          roomId: showtime.room._id,
          seat: selectedSeats,
          customerName,
          customerPhone,
          ticketPrice,
          discountPrice,
          discountReference,
          paymentMethod,
          transactionId,
          bankName,
          totalPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');

      toast.success('Booking confirmed!');

      // After a successful booking, re-fetch the showtime data to get the latest seat status
      fetchShowtime();

      // Reset form fields
      setSelectedSeats([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountPrice(null);
      setDiscountReference('');
      setTransactionId('');
      setPaymentMethod('Cash');
      setBankName('HBL');
      setHasDiscount(false);
      setLoading(false)
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  /* -------------------- Cancel Booking -------------------- */
  const cancelBooking = async (seatNumber: string, bookingId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/bookings/cancel/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelledBy: user?.role || 'Unknown' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');
      
      toast.success(`Booking cancelled for seat ${seatNumber}`);
      
      // Re-fetch the showtime data to get the latest seat status.
      // This is the core fix to ensure the UI updates correctly.
      fetchShowtime();
      setLoading(false);

    } catch (err: any) {
      toast.error(err.message || 'Server error while cancelling booking');
    }
  };

  /* -------------------- Render -------------------- */
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-950 text-xl text-gray-400">Loading showtime...</div>;
  if (error) return <div className="p-8 text-center text-xl text-red-500 bg-gray-950 min-h-screen flex items-center justify-center">{error}</div>;
  if (!showtime) return <div className="p-8 text-center text-xl text-gray-500 bg-gray-950 min-h-screen flex items-center justify-center">❌ Showtime not found</div>;

  const rows = Math.max(...showtime.seats.map((s) => s.row), 0);
  const cols = Math.max(...showtime.seats.map((s) => s.column), 0);
  const ticketPrice = selectedSeats.reduce((sum, s) => {
    const seat = showtime.seats.find((seat) => seat.seatNumber === s);
    return sum + (seat?.type === 'VIP' ? showtime.ticketPrices.VIP : showtime.ticketPrices.Normal);
  }, 0);
  const totalPrice = ticketPrice - (discountPrice || 0);

  return (
    <HomeWrapper>
      <div className="bg-gray-950 text-gray-100 p-6 sm:p-10 h-[calc(100vh-79px)] overflow-y-auto scrollbar-y">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Panel */}
          <div className="lg:w-1/3 flex flex-col gap-8">
            {/* Movie Info */}
            <header className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <Clapperboard className="text-blue-500 w-12 h-12" />
                <div>
                  <h1 className="text-2xl font-bold">{showtime.movie.title}</h1>
                  <p className="text-sm text-gray-500">{showtime.date} | {showtime.time}</p>
                </div>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-center gap-2"><MonitorDot size={16} /> Room: {showtime.room.name}</li>
                <li className="flex items-center gap-2"><CalendarDays size={16} /> Date: {showtime.date}</li>
              </ul>
            </header>

            {/* Customer Details */}
            <section className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaUser className="text-blue-400" /> Customer Details</h2>
              <div className="flex flex-col gap-4">
                <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-blue-500" />

                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={hasDiscount} onChange={(e) => setHasDiscount(e.target.checked)} className="w-4 h-4" /> Discount
                </label>
                {hasDiscount && (
                  <>
                    <input type="number" placeholder="Discount Price (Rs)" value={discountPrice ?? ''} onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : null)} className="w-full p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-yellow-500 mt-2" />
                    <input type="text" placeholder="Discount Reference" value={discountReference} onChange={(e) => setDiscountReference(e.target.value)} className="w-full p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-yellow-500 mt-2" />
                  </>
                )}

                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-full p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-green-500">
                  <option value="Cash">Cash</option>
                  <option value="JazzCash/EasyPaisa">JazzCash/EasyPaisa</option>
                  <option value="Bank">Bank</option>
                </select>

                {paymentMethod === 'Bank' && (
                  <select value={bankName} onChange={(e) => setBankName(e.target.value as any)} className="w-full p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-green-500 mt-2">
                    <option value="HBL">HBL</option>
                    <option value="Allied">Allied</option>
                    <option value="UBL">UBL</option>
                    <option value="Meezan">Meezan</option>
                  </select>
                )}

                {paymentMethod !== 'Cash' && (
                  <input type="text" placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-green-500" />
                )}
              </div>
            </section>

            {/* Booking Summary */}
            <section className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaTicketAlt className="text-blue-400" /> Booking Summary</h2>
              <ul className="text-gray-400 space-y-2 mb-6">
                <li className="flex justify-between"><span>Seats:</span> <span>{selectedSeats.join(', ') || 'None'}</span></li>
                <li className="flex justify-between"><span>Tickets:</span> <span>{selectedSeats.length}</span></li>
                <li className="flex justify-between"><span>Ticket Price:</span> <span>Rs. {ticketPrice}</span></li>
                {(discountPrice ?? 0) > 0 && (
                  <li className="flex justify-between text-green-400"><span>Discount:</span> <span>- Rs. {discountPrice}</span></li>
                )}
                <li className="flex justify-between font-bold text-yellow-300 border-t border-gray-700 pt-2">
                  <span>Total:</span> <span>Rs. {totalPrice}</span>
                </li>
              </ul>
              <button onClick={handleBooking} disabled={!customerName || !customerPhone || selectedSeats.length === 0 || bookingLoading} className="w-full py-4 bg-blue-600 rounded-lg disabled:bg-gray-700 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {bookingLoading ? 'Booking...' : 'Confirm Booking'} <ChevronRight size={16} />
              </button>
            </section>
          </div>

          {/* Right Panel - Seat Grid */}
          <div className="lg:w-2/3 flex flex-col">
            <section className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex-1 flex flex-col">
              <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2"><FaChair className="text-blue-400" /> Select Your Seats</h2>

              <div className="flex justify-center mb-6">
                <div className="bg-gray-800 px-10 py-3 rounded-t-lg font-bold border border-gray-700 border-b-0 text-sm uppercase">Screen</div>
              </div>

              <div className="flex-1 flex justify-center items-center">
                <div className="grid gap-3 p-4 bg-gray-800 rounded-lg" style={{ gridTemplateColumns: `repeat(${cols}, minmax(48px, 1fr))` }}>
                  {Array.from({ length: rows }).map((_, r) =>
                    Array.from({ length: cols }).map((_, c) => {
                      const seat = showtime.seats.find((s) => s.row === r + 1 && s.column === c + 1);
                      if (!seat) return <div key={`${r}-${c}`} />;

                      let className = '';
                      if (selectedSeats.includes(seat.seatNumber)) className = 'bg-cyan-500 hover:bg-cyan-600 border-2 border-white shadow-lg cursor-pointer';
                      else if (seat.isBooked) className = 'bg-red-600 opacity-80 cursor-pointer';
                      else if (seat.type === 'Disabled' || (!seat.isAvailable && !seat.isBooked)) className = 'bg-gray-500 cursor-not-allowed';
                      else if (seat.type === 'VIP') className = 'bg-amber-400 hover:bg-amber-500 shadow-amber-300/50 text-black cursor-pointer';
                      else className = 'bg-green-600 cursor-pointer';

                      const handleClick = () => {
                        if (seat.type === 'Disabled') return toast.warn('This seat is disabled.');
                        if (seat.isBooked && seat.bookingId) {
                          Swal.fire({
                            title: `Cancel Booking ${seat.seatNumber}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No',
                            background: 'black',
                            color: 'white',
                          }).then((res) => {
                            if (res.isConfirmed) cancelBooking(seat.seatNumber, seat.bookingId!);
                          });
                          return;
                        }
                        toggleSeat(seat.seatNumber);
                      };

                      return (
                        <button key={seat.seatNumber} onClick={handleClick} disabled={seat.type === 'Disabled'} className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs ${className}`}>
                          {seat.seatNumber}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Ticket Prices Section */}
              <div className="mt-6 flex flex-col gap-2 text-gray-300 text-sm">
                <div className="flex justify-between bg-gray-800 px-4 py-2 rounded-lg">
                  <span>🎟️ VIP Ticket Price:</span>
                  <span className="font-semibold text-violet-400">Rs. {showtime.ticketPrices.VIP}</span>
                </div>
                <div className="flex justify-between bg-gray-800 px-4 py-2 rounded-lg">
                  <span>🎟️ Normal Ticket Price:</span>
                  <span className="font-semibold text-green-400">Rs. {showtime.ticketPrices.Normal}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 mt-8 text-sm justify-center text-gray-400">
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-green-600 rounded"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-cyan-500 rounded"></div> Selected</div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-red-600 rounded"></div> Booked</div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-amber-400 rounded"></div> VIP</div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-500 rounded"></div> Disabled</div>
              </div>

              {!showtime.seats.some((s) => s.isAvailable && s.type !== 'Disabled') && (
                <div className="mt-6 text-center text-red-500 font-bold text-lg">❌ All seats reserved</div>
              )}
            </section>
          </div>
        </div>
      </div>
    </HomeWrapper>
  );
}