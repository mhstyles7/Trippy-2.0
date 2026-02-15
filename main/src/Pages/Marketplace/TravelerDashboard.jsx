import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TravelerDashboard = () => {
    const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'inbox'
    const [myRequests, setMyRequests] = useState([]);
    const [offers, setOffers] = useState({}); // Map requestId -> offers[]
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    // New Request Form State
    const [newRequest, setNewRequest] = useState({
        destination: '', dates: '', groupSize: '', budget: '', vehicleType: 'Microbus', description: ''
    });

    useEffect(() => {
        if (user) {
            fetchMyRequests();
        }
    }, [user]);

    const fetchMyRequests = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/trip-requests/my/${user._id}`);
            setMyRequests(res.data);
            // Fetch offers for each open request
            res.data.forEach(req => {
                if (req.status === 'open') fetchOffers(req._id);
            });
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const fetchOffers = async (requestId) => {
        try {
            const res = await axios.get(`http://localhost:3000/rental-offers/request/${requestId}`);
            setOffers(prev => ({ ...prev, [requestId]: res.data }));
        } catch (error) {
            console.error("Error fetching offers:", error);
        }
    };

    const handlePostRequest = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/trip-requests', { ...newRequest, travelerId: user._id });
            fetchMyRequests();
            setNewRequest({ destination: '', dates: '', groupSize: '', budget: '', vehicleType: 'Microbus', description: '' });
            alert('Trip Request Posted! Providers will bid soon.');
        } catch (error) {
            alert('Failed to post request');
        }
    };

    const handleOfferResponse = async (offerId, status) => {
        try {
            await axios.post('http://localhost:3000/rental-offers/respond', { offerId, status });
            fetchMyRequests(); // Refresh status
            alert(`Offer ${status}!`);
        } catch (error) {
            alert('Failed to update offer');
        }
    };

    return (
        <div className="min-h-screen bg-base-100 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display gradient-text">Traveler Dashboard</h1>
                        <p className="opacity-60">Plan your trips and get the best rides</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => document.getElementById('new-trip-modal').showModal()}>
                        ➕ Post New Trip
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {myRequests.length === 0 ? (
                        <div className="text-center py-20 opacity-50">You haven't posted any trip plans yet.</div>
                    ) : (
                        myRequests.map(req => (
                            <div key={req._id} className="collapse collapse-arrow bg-base-200 border border-white/5">
                                <input type="checkbox" defaultChecked />
                                <div className="collapse-title text-xl font-medium flex justify-between items-center pr-12">
                                    <div>
                                        {req.destination} <span className="text-sm opacity-60 ml-2">({req.dates})</span>
                                    </div>
                                    <div className={`badge ${req.status === 'open' ? 'badge-success' : 'badge-neutral'}`}>
                                        {req.status.toUpperCase()}
                                    </div>
                                </div>
                                <div className="collapse-content">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6 bg-base-100/50 p-4 rounded-xl">
                                        <div><span className="opacity-50 block text-xs">VEHICLE</span>{req.vehicleType}</div>
                                        <div><span className="opacity-50 block text-xs">GROUP</span>{req.groupSize} People</div>
                                        <div><span className="opacity-50 block text-xs">BUDGET</span>৳{req.budget}</div>
                                        <div><span className="opacity-50 block text-xs">NOTE</span>{req.description}</div>
                                    </div>

                                    {/* OFFERS SECTION */}
                                    <h3 className="font-bold text-sm opacity-70 mb-3">RECEIVED OFFERS ({offers[req._id]?.length || 0})</h3>
                                    <div className="space-y-3">
                                        {offers[req._id]?.length > 0 ? (
                                            offers[req._id].map(offer => (
                                                <div key={offer._id} className="card bg-base-100 shadow-sm border border-primary/20">
                                                    <div className="card-body p-4 flex-row items-center gap-4">
                                                        <img src={offer.vehicleSnapshot?.image} className="w-16 h-12 object-cover rounded-lg" />
                                                        <div className="flex-1">
                                                            <div className="font-bold">৳{offer.price} <span className="text-xs font-normal opacity-70">quoted by {offer.providerName}</span></div>
                                                            <div className="text-xs opacity-70">{offer.vehicleSnapshot?.name} • {offer.message}</div>
                                                        </div>
                                                        {offer.status === 'pending' && req.status === 'open' ? (
                                                            <div className="flex gap-2">
                                                                <button className="btn btn-xs btn-success" onClick={() => handleOfferResponse(offer._id, 'accepted')}>Accept</button>
                                                                <button className="btn btn-xs btn-ghost text-error" onClick={() => handleOfferResponse(offer._id, 'rejected')}>Decline</button>
                                                            </div>
                                                        ) : (
                                                            <div className={`badge ${offer.status === 'accepted' ? 'badge-success' : 'badge-ghost'}`}>{offer.status}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm opacity-50 italic">No offers received yet. Providers will bid soon!</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* New Trip Modal */}
            <dialog id="new-trip-modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Post a Trip Request</h3>
                    <form onSubmit={handlePostRequest} className="flex flex-col gap-3">
                        <input type="text" placeholder="Destination (e.g. Sylhet)" className="input input-bordered w-full" value={newRequest.destination} onChange={e => setNewRequest({ ...newRequest, destination: e.target.value })} required />
                        <input type="text" placeholder="Dates (e.g. Nov 12-15)" className="input input-bordered w-full" value={newRequest.dates} onChange={e => setNewRequest({ ...newRequest, dates: e.target.value })} required />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" placeholder="Group Size" className="input input-bordered w-full" value={newRequest.groupSize} onChange={e => setNewRequest({ ...newRequest, groupSize: e.target.value })} required />
                            <input type="number" placeholder="Budget (Tk)" className="input input-bordered w-full" value={newRequest.budget} onChange={e => setNewRequest({ ...newRequest, budget: e.target.value })} required />
                        </div>
                        <select className="select select-bordered w-full" value={newRequest.vehicleType} onChange={e => setNewRequest({ ...newRequest, vehicleType: e.target.value })}>
                            <option>Microbus</option>
                            <option>Sedan</option>
                            <option>SUV</option>
                            <option>Minivan</option>
                            <option>Bus</option>
                        </select>
                        <textarea className="textarea textarea-bordered" placeholder="Special requirements..." value={newRequest.description} onChange={e => setNewRequest({ ...newRequest, description: e.target.value })}></textarea>

                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => document.getElementById('new-trip-modal').close()}>Cancel</button>
                            <button type="submit" className="btn btn-primary" onClick={() => document.getElementById('new-trip-modal').close()}>Post Trip 🚀</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default TravelerDashboard;
