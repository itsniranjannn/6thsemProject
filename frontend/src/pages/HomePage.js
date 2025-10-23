import React from 'react';
import { Link } from 'react-router-dom';
import SupportWidget from '../components/SupportWidget.js';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to Nexus Store</h1>
        <p style={styles.heroSubtitle}>Your one-stop destination for amazing products</p>
        <Link to="/products" style={styles.ctaButton}>
          Shop Now
        </Link>
      </section>
      
      <section style={styles.features}>
        <h2>Why Choose Nexus Store?</h2>
        <div style={styles.featureGrid}>
          <div style={styles.feature}>
            <h3>🛒 Easy Shopping</h3>
            <p>Simple and intuitive shopping experience</p>
          </div>
          <div style={styles.feature}>
            <h3>🚚 Fast Delivery</h3>
            <p>Quick and reliable shipping</p>
          </div>
          <div style={styles.feature}>
            <h3>💳 Secure Payments</h3>
            <p>Safe and secure payment options</p>
          </div>
        </div>
      </section>
      
      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '80vh',
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#ecf0f1',
  },
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: '#7f8c8d',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '1rem 2rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1.1rem',
  },
  features: {
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  feature: {
    padding: '2rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
};

export default HomePage;