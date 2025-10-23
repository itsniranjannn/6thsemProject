import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; 2024 Nexus Store. All rights reserved.</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#34495e',
    color: 'white',
    textAlign: 'center',
    padding: '1rem',
    marginTop: '2rem',
  },
};

export default Footer;