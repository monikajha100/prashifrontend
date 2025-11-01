import React from 'react';
import { useQuery } from 'react-query';
import { promotionalOffersAPI } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Offers.css';

const Offers = () => {
  const { data: offers = [], isLoading } = useQuery(
    'promotionalOffers',
    () => promotionalOffersAPI.getAll().then(res => res.data),
    {
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching offers:', error);
      }
    }
  );

  if (isLoading) {
    return (
      <div className="offers-page">
        <div className="container">
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Loading offers...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeOffers = offers.filter(offer => {
    if (!offer.is_active) return false;
    const now = new Date();
    if (offer.starts_at && new Date(offer.starts_at) > now) return false;
    if (offer.expires_at && new Date(offer.expires_at) < now) return false;
    return true;
  });

  return (
    <div className="offers-page">
      <Helmet>
        <title>Special Offers & Cashback - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <div className="offers-header">
          <h1>Special Offers & Cashback</h1>
          <p>Discover amazing deals and exclusive offers</p>
        </div>

        {activeOffers.length === 0 ? (
          <div className="offers-empty">
            <h2>No active offers at the moment</h2>
            <p>Check back soon for exciting deals!</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="offers-grid">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="offer-card"
                style={{
                  backgroundColor: offer.background_color || '#FF6B6B',
                  color: offer.text_color || '#FFFFFF'
                }}
              >
                <div className="offer-icon">{offer.icon || '🎁'}</div>
                <div className="offer-content">
                  <h2>{offer.title}</h2>
                  {offer.description && <p className="offer-description">{offer.description}</p>}
                  <div className="offer-details">
                    {offer.discount_value > 0 && (
                      <div className="offer-discount">
                        {offer.discount_type === 'percentage' ? (
                          <span className="discount-value">{offer.discount_value}% OFF</span>
                        ) : (
                          <span className="discount-value">₹{offer.discount_value} OFF</span>
                        )}
                      </div>
                    )}
                    {offer.minimum_amount > 0 && (
                      <p className="offer-minimum">Min. purchase: ₹{parseFloat(offer.minimum_amount).toFixed(2)}</p>
                    )}
                    {offer.offer_type === 'buy_x_get_y' && (
                      <p className="offer-buy-get">
                        Buy {offer.buy_quantity} Get {offer.get_quantity} Free
                      </p>
                    )}
                    {offer.expires_at && (
                      <p className="offer-expiry">
                        Valid until: {new Date(offer.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Link
                    to="/products"
                    className="offer-button"
                    style={{
                      backgroundColor: offer.button_color || '#FFB6C1',
                      color: offer.text_color || '#FFFFFF'
                    }}
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;


