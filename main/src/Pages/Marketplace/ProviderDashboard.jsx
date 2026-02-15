import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'garage'
    const [vehicles, setVehicles] = useState([]);
    const [leads, setLeads] = useState([]);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [showBidModal, setShowBidModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [bidMessage, setBidMessage] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

    // Garage Form State
    const [newVehicle, setNewVehicle] = useState({ name: '', type: 'Sedan', seats: 4, ac: true, pricePerDay: '', image: '' });

    useEffect(() => {
        if (user) {
            fetchVehicles();
            fetchLeads();
        }
    }, [user]);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/vehicles/${user._id}`);
            setVehicles(res.data);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await axios.get('http://localhost:3000/trip-requests/open');
            setLeads(res.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/vehicles', { ...newVehicle, providerId: user._id });
            fetchVehicles();
            setNewVehicle({ name: '', type: 'Sedan', seats: 4, ac: true, pricePerDay: '', image: '' });
            alert('Vehicle added to garage!');
        } catch (error) {
            alert('Failed to add vehicle');
        }
    };

    const handleDeleteVehicle = async (id) => {
        if (!confirm('Remove this vehicle?')) return;
        try {
            await axios.delete(`http://localhost:3000/vehicles/${id}`);
            fetchVehicles();
        } catch (error) {
            alert('Failed to delete vehicle');
        }
    };

    const openBidModal = (lead) => {
        if (vehicles.length === 0) {
            alert("Please add a vehicle to your garage first!");
            setActiveTab('garage');
            return;
        }
        setSelectedLead(lead);
        setSelectedVehicleId(vehicles[0]._id); // Default to first car
        setShowBidModal(true);
    };

    const submitBid = async () => {
        try {
            await axios.post('http://localhost:3000/rental-offers', {
                requestId: selectedLead._id,
                providerId: user._id,
                vehicleId: selectedVehicleId,
                price: parseInt(bidPrice),
                message: bidMessage
            });
            setShowBidModal(false);
            setBidPrice('');
            setBidMessage('');
            alert('Offer sent successfully!');
        } catch (error) {
            alert('Failed to send offer');
        }
    };

    return (
        <div className="min-h-screen bg-base-100 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display gradient-text">Provider Dashboard</h1>
                        <p className="opacity-60">Manage your fleet and find customers</p>
                    </div>
                    <div className="tabs tabs-boxed bg-base-200 p-1">
                        <a className={`tab ${activeTab === 'leads' ? 'tab-active bg-primary text-white' : ''}`} onClick={() => setActiveTab('leads')}>Trip Leads 🗺️</a>
                        <a className={`tab ${activeTab === 'garage' ? 'tab-active bg-secondary text-white' : ''}`} onClick={() => setActiveTab('garage')}>My Garage 🚘</a>
                    </div>
                </div>

                {/* === LEADS TAB === */}
                {activeTab === 'leads' && (
                    <div className="grid grid-cols-1 gap-6">
                        {leads.length === 0 ? (
                            <div className="text-center py-20 opacity-50">No active trip requests at the moment.</div>
                        ) : (
                            leads.map(lead => (
                                <div key={lead._id} className="card bg-base-100 shadow-xl border border-white/5 hover:border-primary/20 transition-all">
                                    <div className="card-body">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="avatar">
                                                    <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                                        <img src={lead.travelerPhoto || "https://api.dicebear.com/7.x/adventurer/svg?seed=unknown"} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{lead.destination}</h3>
                                                    <p className="text-sm opacity-70">by {lead.travelerName} {lead.travelerVerified && '✅'}</p>
                                                </div>
                                            </div>
                                            <div className="badge badge-primary badge-outline">{lead.dates}</div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-base-200/50 p-4 rounded-xl">
                                            <div><span className="opacity-50 block text-xs">VEHICLE TYPE</span>{lead.vehicleType}</div>
                                            <div><span className="opacity-50 block text-xs">PASSENGERS</span>{lead.groupSize} Persons</div>
                                            <div><span className="opacity-50 block text-xs">BUDGET</span>৳{lead.budget}</div>
                                            <div><span className="opacity-50 block text-xs">DESCRIPTION</span>{lead.description}</div>
                                        </div>

                                        <div className="card-actions justify-end mt-4">
                                            <button className="btn btn-primary btn-sm" onClick={() => openBidModal(lead)}>Make an Offer 🏷️</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* === GARAGE TAB === */}
                {activeTab === 'garage' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Add Vehicle Form */}
                        <div className="card bg-base-200 h-fit">
                            <div className="card-body">
                                <h3 className="card-title text-sm opacity-70 mb-4">ADD NEW VEHICLE</h3>
                                <form onSubmit={handleAddVehicle} className="flex flex-col gap-3">
                                    <input type="text" placeholder="Vehicle Name (e.g. Toyota Noah)" className="input input-sm w-full" value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} required />
                                    <select className="select select-sm w-full" value={newVehicle.type} onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })}>
                                        <option>Sedan</option>
                                        <option>SUV</option>
                                        <option>Microbus</option>
                                        <option>Minivan</option>
                                        <option>Bus</option>
                                    </select>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder="Seats" className="input input-sm w-full" value={newVehicle.seats} onChange={e => setNewVehicle({ ...newVehicle, seats: e.target.value })} required />
                                        <input type="number" placeholder="Rent/Day (Tk)" className="input input-sm w-full" value={newVehicle.pricePerDay} onChange={e => setNewVehicle({ ...newVehicle, pricePerDay: e.target.value })} required />
                                    </div>
                                    <input type="text" placeholder="Image URL" className="input input-sm w-full" value={newVehicle.image} onChange={e => setNewVehicle({ ...newVehicle, image: e.target.value })} />
                                    <label className="label cursor-pointer justify-start gap-2">
                                        <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={newVehicle.ac} onChange={e => setNewVehicle({ ...newVehicle, ac: e.target.checked })} />
                                        <span className="label-text">AC Available</span>
                                    </label>
                                    <button className="btn btn-secondary btn-sm mt-2">Add Vehicle ➕</button>
                                </form>
                            </div>
                        </div>

                        {/* Vehicle List */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vehicles.map(v => (
                                <div key={v._id} className="card bg-base-100 shadow-lg border border-white/5 group">
                                    <figure className="h-40 overflow-hidden relative">
                                        <img src={v.image || "https://placehold.co/600x400?text=No+Image"} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute top-2 right-2 badge badge-neutral">{v.status}</div>
                                    </figure>
                                    <div className="card-body p-4">
                                        <h3 className="font-bold">{v.name}</h3>
                                        <div className="flex gap-2 text-xs opacity-70">
                                            <span className="badge badge-ghost badge-sm">{v.type}</span>
                                            <span className="badge badge-ghost badge-sm">{v.seats} Seats</span>
                                            <span className="badge badge-ghost badge-sm">{v.ac ? 'AC' : 'Non-AC'}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="font-bold text-primary">৳{v.pricePerDay}/day</span>
                                            <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDeleteVehicle(v._id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bid Modal */}
            {showBidModal && selectedLead && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Send Offer to {selectedLead.travelerName}</h3>
                        <div className="flex flex-col gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Select Vehicle</span></label>
                                <select className="select select-bordered" value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id}>{v.name} ({v.seats} seats) - Base: ৳{v.pricePerDay}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Your Price (Tk)</span></label>
                                <input type="number" className="input input-bordered" value={bidPrice} onChange={e => setBidPrice(e.target.value)} placeholder="Enter total amount" />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Message</span></label>
                                <textarea className="textarea textarea-bordered" value={bidMessage} onChange={e => setBidMessage(e.target.value)} placeholder="Describe your service..." rows={3}></textarea>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button className="btn" onClick={() => setShowBidModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitBid}>Send Offer 🚀</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;
