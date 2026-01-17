'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { PLASMIC } from '../plasmic-init';

function GoodLifeForm({
  formHandle = 'goodlife_fitness_pwhl_event',
  customSubmitUrl = '/api/lead-submit',
  redirectUrl = '/questions',
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    postal_code: '',
    opt_in_email: false,
    agree_rules: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const errs = {};

    if (!values.first_name.trim()) errs.first_name = 'First name is required';
    if (!values.last_name.trim()) errs.last_name = 'Last name is required';
    if (!values.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errs.email = 'Invalid email format';
    }
    if (!values.phone.trim()) errs.phone = 'Phone is required';
    if (!values.postal_code.trim()) errs.postal_code = 'Postal code is required';
    if (!values.agree_rules) errs.agree_rules = 'You must agree to the rules and regulations';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const webLeadData = {
        phoneNumber: values.phone,
        emailAddress: values.email,
        lastName: values.last_name,
        firstName: values.first_name,
        adobeId: '',
        offerID: 0,
        categoryID: 0,
        submittedUrl: window.location.href,
        club: {
          clubId: 0,
          province: '',
          city: '',
          name: '',
          address1: '',
          address2: '',
          postalCode: values.postal_code,
          phoneNumber: '',
          emailAddress: '',
          urlRelativePath: '',
          coEd: true
        }
      };

      const response = await fetch('https://qaapi.goodlifefitness.com/webleads/v1/api/WebLead', {
        method: 'POST',
        headers: {
          'ocp-apim-subscription-key': '3c73d2a6fc6d4bff9b838dfcb7efaba6',
          'Content-Type': 'application/json',
          'Authorization': 'Basic Og=='
        },
        body: JSON.stringify(webLeadData),
      });

      if (response.ok) {
        if (redirectUrl) router.push(redirectUrl);
      } else {
        const errorData = await response.text();
        console.error('Form submission error:', errorData);
        setErrors({ submit: 'Failed to submit form. Please try again.' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px 40px',
    marginBottom: '40px',
  };

  const fieldStyle = { display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: '18px', color: '#000', marginBottom: '10px', fontWeight: 400 };
  const requiredStyle = { color: '#ff0000' };
  const inputStyle = {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    backgroundColor: '#b8bdc7',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    outline: 'none',
  };
  const checkboxContainerStyle = { marginBottom: '20px' };
  const checkboxLabelStyle = { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '16px', lineHeight: 1.5, color: '#000' };
  const checkboxStyle = { width: '20px', height: '20px', marginTop: '2px', accentColor: '#000', backgroundColor: '#fff', cursor: 'pointer', flexShrink: 0 };
  const buttonStyle = {
    padding: '14px 50px',
    fontSize: '18px',
    fontWeight: 400,
    color: '#ff0000',
    backgroundColor: 'transparent',
    border: '2px solid #ff0000',
    borderRadius: '50px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'all 0.3s ease',
    display: 'block',
    margin: '40px auto 0',
  };
  const buttonHoverStyle = { backgroundColor: '#ff0000', color: '#fff' };
  const errorStyle = { color: '#ff0000', fontSize: '14px', marginTop: '5px' };
  const [buttonHovered, setButtonHovered] = useState(false);

  const mobileStyle = `
    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr !important; }
      .full-width-mobile { grid-column: span 1 !important; }
    }
  `;

  return (
    <>
      <style jsx>{mobileStyle}</style>
      <div style={containerStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formGridStyle} className="form-grid">
            {/* First Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>First Name <span style={requiredStyle}>*</span></label>
              <input type="text" value={values.first_name} onChange={e => handleChange('first_name', e.target.value)} style={inputStyle} disabled={loading} placeholder="First Name" />
              {errors.first_name && <span style={errorStyle}>{errors.first_name}</span>}
            </div>

            {/* Last Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Last Name <span style={requiredStyle}>*</span></label>
              <input type="text" value={values.last_name} onChange={e => handleChange('last_name', e.target.value)} style={inputStyle} disabled={loading} placeholder="Last Name" />
              {errors.last_name && <span style={errorStyle}>{errors.last_name}</span>}
            </div>

            {/* Email */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Email <span style={requiredStyle}>*</span></label>
              <input type="email" value={values.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle} disabled={loading} placeholder="Email" />
              {errors.email && <span style={errorStyle}>{errors.email}</span>}
            </div>

            {/* Phone */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Phone Number <span style={requiredStyle}>*</span></label>
              <input type="tel" value={values.phone} onChange={e => handleChange('phone', e.target.value)} style={inputStyle} disabled={loading} placeholder="Phone Number" />
              {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
            </div>

            {/* Postal Code */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Postal Code <span style={requiredStyle}>*</span></label>
              <input type="text" value={values.postal_code} onChange={e => handleChange('postal_code', e.target.value)} style={inputStyle} disabled={loading} placeholder="Postal Code" />
              {errors.postal_code && <span style={errorStyle}>{errors.postal_code}</span>}
            </div>
          </div>

          {/* Checkboxes */}
          <div style={checkboxContainerStyle}>
            <label style={checkboxLabelStyle}>
              <input type="checkbox" checked={values.opt_in_email} onChange={e => handleChange('opt_in_email', e.target.checked)} style={checkboxStyle} disabled={loading} />
              <span>I agree to receive GoodLife Fitness emails, promotions, and offers. I can opt out at any time.</span>
            </label>
          </div>

          <div style={checkboxContainerStyle}>
            <label style={checkboxLabelStyle}>
              <input type="checkbox" checked={values.agree_rules} onChange={e => handleChange('agree_rules', e.target.checked)} style={checkboxStyle} disabled={loading} />
              <span>I have read and agree to the Rules and Regulations</span>
            </label>
            {errors.agree_rules && <span style={errorStyle}>{errors.agree_rules}</span>}
          </div>

          {errors.submit && <div style={{ ...errorStyle, textAlign: 'center', marginBottom: '20px' }}>{errors.submit}</div>}

          <button type="submit" disabled={loading} style={{ ...buttonStyle, ...(buttonHovered && !loading ? buttonHoverStyle : {}) }} onMouseEnter={() => setButtonHovered(true)} onMouseLeave={() => setButtonHovered(false)}>
            {loading ? 'Submitting...' : 'Next'}
          </button>
        </form>
      </div>
    </>
  );
}

export default GoodLifeForm;

// Register with Plasmic
PLASMIC.registerComponent(GoodLifeForm, {
  name: 'GoodLifeForm',
  props: {
    formHandle: { type: 'string', defaultValue: 'goodlife_fitness_pwhl_event', description: 'Form handle identifier' },
    customSubmitUrl: { type: 'string', defaultValue: '/api/lead-submit', description: 'Custom URL to submit the form' },
    redirectUrl: { type: 'string', defaultValue: '/questions', description: 'URL to redirect to after successful submission' }
  }
});
